# ══════════════════════════════════════════════════════════════════════
#  Alur utama LAYER 0–7, semua logika detail ada di modul terpisah
# ══════════════════════════════════════════════════════════════════════

import os

# Import embedding model
from langchain_cohere import CohereEmbeddings

# Import Qwen LLM
from langchain_openai import ChatOpenAI

# Import koneksi Supabase
from database.supabase_client import get_supabase

# Import threat analyzer
from .threat_analyzer import ThreatAnalyzer

# Import constants
from .constants import (
    GREETING_TRIGGERS,
    FORBIDDEN_TOPICS,
    GREETING_RESPONSE,
    OUT_OF_SCOPE_RESPONSE,
    NOT_FOUND_RESPONSE
)

# Import modular service
from .query_rewriter import rewrite_query
from .retriever import retrieve_chunks, log_chunks
from .context_formatter import format_context
from .relevance_checker import is_relevant
from .generator import generate_answer, generate_fallback


class CyberGuardRAG:

    # Setup seluruh service utama
    def __init__(self):

        # Setup embedding model
        self.embeddings = CohereEmbeddings(
            model="embed-multilingual-v3.0"
        )

        # Setup Supabase
        self.supabase = get_supabase()

        # Setup threat analyzer
        self.analyzer = ThreatAnalyzer()

        # Setup Qwen LLM
        self.llm = ChatOpenAI(
            model="Qwen/Qwen3-14B:nscale",
            openai_api_base="https://router.huggingface.co/v1",
            openai_api_key=os.getenv("HUGGINGFACE_API_KEY"),
            temperature=0.3,
            request_timeout=120,
        )

    # Cek apakah input adalah greeting
    def _is_greeting(self, query: str) -> bool:

        q = query.lower().strip()

        return q in GREETING_TRIGGERS or any(
            q.startswith(t)
            for t in GREETING_TRIGGERS
        )

    # Cek forbidden topic
    def _is_forbidden(self, text: str) -> bool:

        words = set(text.lower().split())

        return any(
            forbidden in words
            for forbidden in FORBIDDEN_TOPICS
        )

    # Format hasil threat analysis
    def _format_tech_flags(self, analysis: dict) -> str:

        if analysis.get("reasons"):

            flags = "\n".join(
                f"- {r}"
                for r in analysis["reasons"]
            )

            return (
                f"TEMUAN TEKNIS TERDETEKSI:\n{flags}"
            )

        return (
            "Tidak ada indikasi teknis "
            "berbahaya pada input ini."
        )

    # Format chat history menjadi string
    @staticmethod
    def _format_history(chat_history: list) -> str:

        if not chat_history:
            return "Tidak ada riwayat percakapan."

        lines = []

        # Ambil 6 history terakhir
        for msg in chat_history[-6:]:

            role = (
                "User"
                if msg["role"] == "user"
                else "CyberGuard"
            )

            lines.append(
                f"{role}: {msg['content']}"
            )

        return "\n".join(lines)

    # Main pipeline chatbot RAG
    async def get_response(
        self,
        query: str,
        chat_history: list = None
    ) -> dict:

        # Bersihkan query user
        user_query = query.strip()

        # Format history chat
        history_text = self._format_history(
            chat_history
        )

        # Validasi greeting
        if self._is_greeting(user_query):

            return {
                "reply": GREETING_RESPONSE,
                "risk": 0,
                "findings": []
            }

        # Validasi forbidden topic
        if self._is_forbidden(user_query):

            return {
                "reply": OUT_OF_SCOPE_RESPONSE,
                "risk": 0,
                "findings": []
            }

        # Threat analysis URL / ancaman
        analysis = await self.analyzer.analyze(
            user_query
        )

        # Format hasil threat analysis
        tech_flags = self._format_tech_flags(
            analysis
        )

        # Rewrite query untuk retrieval
        rewritten = rewrite_query(
            self.llm,
            user_query
        )

        print(
            f"[REWRITE] "
            f"{user_query} → {rewritten}"
        )

        # Retrieval chunk dari vector database
        docs = retrieve_chunks(
            self.embeddings,
            self.supabase,
            rewritten
        )

        # Fallback jika chunk kosong
        if not docs:

            has_history = (
                history_text !=
                "Tidak ada riwayat percakapan."
            )

            reply = (
                generate_fallback(
                    self.llm,
                    user_query,
                    history_text
                )

                if has_history

                else NOT_FOUND_RESPONSE
            )

            return {
                "reply": reply,
                "risk": analysis.get("score", 15),
                "findings": analysis.get("reasons", [])
            }

        # Debug retrieved chunk
        log_chunks(docs)

        # Format context retrieval
        context_text = format_context(docs)

        # Validasi relevansi chunk
        if not is_relevant(docs, user_query):

            has_history = (
                history_text !=
                "Tidak ada riwayat percakapan."
            )

            reply = (
                generate_fallback(
                    self.llm,
                    user_query,
                    history_text
                )

                if has_history

                else NOT_FOUND_RESPONSE
            )

            return {
                "reply": reply,
                "risk": analysis.get("score", 15),
                "findings": analysis.get("reasons", [])
            }

        # Generate jawaban menggunakan Qwen
        reply_text = generate_answer(
            self.llm,
            context_text,
            user_query,
            tech_flags,
            history_text
        )

        # Safety filter final
        if self._is_forbidden(reply_text):

            return {
                "reply": OUT_OF_SCOPE_RESPONSE,
                "risk": 0,
                "findings": []
            }

        # Return final response
        return {
            "reply": reply_text,
            "risk": analysis.get("score", 15),
            "findings": analysis.get("reasons", [])
        }