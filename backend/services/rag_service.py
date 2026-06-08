# ══════════════════════════════════════════════════════════════════════
#  CYBERGUARD AI — RAG SERVICE (ORCHESTRATOR)
#  Alur utama LAYER 0–7, semua logika detail ada di modul terpisah
# ══════════════════════════════════════════════════════════════════════

import os
from langchain_cohere import CohereEmbeddings
from langchain_openai import ChatOpenAI
from database.supabase_client import get_supabase
from .threat_analyzer import ThreatAnalyzer

from .constants          import (GREETING_TRIGGERS, FORBIDDEN_TOPICS,
                                  GREETING_RESPONSE, OUT_OF_SCOPE_RESPONSE,
                                  NOT_FOUND_RESPONSE)
from .query_rewriter     import rewrite_query
from .retriever          import retrieve_chunks, log_chunks
from .context_formatter  import format_context
from .relevance_checker  import is_relevant
from .generator          import generate_answer, generate_fallback


class CyberGuardRAG:
    def __init__(self):
        self.embeddings = CohereEmbeddings(model="embed-multilingual-v3.0")
        self.supabase   = get_supabase()
        self.analyzer   = ThreatAnalyzer()
        self.llm = ChatOpenAI(
            model="Qwen/Qwen3-14B:nscale",
            openai_api_base="https://router.huggingface.co/v1",
            openai_api_key=os.getenv("HUGGINGFACE_API_KEY"),
            temperature=0.3,
            request_timeout=120,
        )

    # ── Guard: cek sapaan ─────────────────────────────────────────
    def _is_greeting(self, query: str) -> bool:
        q = query.lower().strip()
        return q in GREETING_TRIGGERS or any(
            q.startswith(t) for t in GREETING_TRIGGERS
        )

    # ── Guard: cek topik terlarang (exact word match) ─────────────
    def _is_forbidden(self, text: str) -> bool:
        words = set(text.lower().split())
        return any(forbidden in words for forbidden in FORBIDDEN_TOPICS)

    # ── Helper: format tech flags dari analyzer ───────────────────
    def _format_tech_flags(self, analysis: dict) -> str:
        if analysis.get("reasons"):
            flags = "\n".join(f"  ⚠ {r}" for r in analysis["reasons"])
            return f"TEMUAN TEKNIS TERDETEKSI:\n{flags}"
        return "Tidak ada indikasi teknis berbahaya pada input ini."

    # ── Helper: format chat history menjadi string ────────────────
    @staticmethod
    def _format_history(chat_history: list) -> str:
        if not chat_history:
            return "Tidak ada riwayat percakapan."
        lines = []
        for msg in chat_history[-6:]:
            role = "User" if msg["role"] == "user" else "CyberGuard"
            lines.append(f"{role}: {msg['content']}")
        return "\n".join(lines)

    # ══════════════════════════════════════════════════════════════
    #  MAIN HANDLER — LAYER 0 s/d 7
    # ══════════════════════════════════════════════════════════════
    async def get_response(self, query: str, chat_history: list = None) -> dict:
        user_query   = query.strip()
        history_text = self._format_history(chat_history)

        # LAYER 0 — Sapaan → welcome message, tanpa RAG
        if self._is_greeting(user_query):
            return {"reply": GREETING_RESPONSE, "risk": 0, "findings": []}

        # LAYER 1 — Topik terlarang → tolak langsung
        if self._is_forbidden(user_query):
            return {"reply": OUT_OF_SCOPE_RESPONSE, "risk": 0, "findings": []}

        # LAYER 2 — Analisis teknis (URL / ancaman)
        analysis   = await self.analyzer.analyze(user_query)
        tech_flags = self._format_tech_flags(analysis)
        

        # LAYER 3 — Rewrite query → Embedding → Retrieval
        rewritten = rewrite_query(self.llm, user_query)
        print(f"[REWRITE] {user_query} → {rewritten}")
        docs = retrieve_chunks(self.embeddings, self.supabase, rewritten)

        # LAYER 4 — Tidak ada chunk → fallback ke chat history
        if not docs:
            has_history = history_text != "Tidak ada riwayat percakapan."
            reply = (generate_fallback(self.llm, user_query, history_text)
                     if has_history else NOT_FOUND_RESPONSE)
            return {
                "reply"   : reply,
                "risk"    : analysis.get("score", 15),
                "findings": analysis.get("reasons", [])
            }

        log_chunks(docs)  # debug — hapus di production
        context_text = format_context(docs)

        # LAYER 5.5 — Chunk tidak relevan → fallback ke chat history
        if not is_relevant(docs, user_query):
            has_history = history_text != "Tidak ada riwayat percakapan."
            reply = (generate_fallback(self.llm, user_query, history_text)
                     if has_history else NOT_FOUND_RESPONSE)
            return {
                "reply"   : reply,
                "risk"    : analysis.get("score", 15),
                "findings": analysis.get("reasons", [])
            }

        # LAYER 6 — Generate jawaban via LLM + RAG context
        reply_text = generate_answer(
            self.llm, context_text, user_query, tech_flags, history_text
        )

        # LAYER 7 — Post-filter: jaring pengaman terakhir
        if self._is_forbidden(reply_text):
            return {"reply": OUT_OF_SCOPE_RESPONSE, "risk": 0, "findings": []}

        return {
            "reply"   : reply_text,
            "risk"    : analysis.get("score", 15),
            "findings": analysis.get("reasons", [])
        }