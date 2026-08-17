import os
import logging

logging.getLogger("httpcore").setLevel(logging.WARNING)
logging.getLogger("hpack").setLevel(logging.WARNING)
logging.getLogger("langfuse").setLevel(logging.WARNING)

from langchain_cohere import CohereEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, AIMessage
from langfuse import Langfuse

from database.supabase_client import get_supabase
from .threat_analyzer import ThreatAnalyzer
from .constants import (
    GREETING_TRIGGERS,
    FORBIDDEN_TOPICS,
    GREETING_RESPONSE,
    OUT_OF_SCOPE_RESPONSE,
    NOT_FOUND_RESPONSE
)
from .query_rewriter import rewrite_query
from .retriever import retrieve_chunks, log_chunks
from .context_formatter import format_context
from .relevance_checker import is_relevant
from .generator import generate_answer, generate_fallback


class CyberGuardRAG:
    def __init__(self):
        self.embeddings = CohereEmbeddings(model="embed-multilingual-v3.0")
        self.supabase = get_supabase()
        self.analyzer = ThreatAnalyzer()

        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=os.getenv("GOOGLE_API_KEY"),
            temperature=0,
        )

        self.langfuse = Langfuse(
            public_key=os.getenv("LANGFUSE_PUBLIC_KEY"),
            secret_key=os.getenv("LANGFUSE_SECRET_KEY"),
            host=os.getenv("LANGFUSE_HOST"),
        )

        print("LANGFUSE HOST:", os.getenv("LANGFUSE_HOST"))
        print("LANGFUSE KEY:", os.getenv("LANGFUSE_PUBLIC_KEY"))

    def _is_greeting(self, text: str) -> bool:
        text_lower = text.lower().strip()
        return any(text_lower.startswith(trigger) for trigger in GREETING_TRIGGERS)

    def _is_forbidden(self, text: str) -> bool:
        text_lower = text.lower()
        return any(topic in text_lower for topic in FORBIDDEN_TOPICS)

    def _format_tech_flags(self, analysis: dict) -> str:
        if not analysis:
            return "Tidak ada indikator ancaman teknis."
        reasons = analysis.get("reasons", [])
        score = analysis.get("score", 0)
        if not reasons:
            return f"Skor risiko: {score}/100. Status: Aman."
        flags = "\n".join(f"- {r}" for r in reasons)
        return f"HASIL ANALISIS TEKNIS (SKOR: {score}/100):\n{flags}"

    def _format_history(self, chat_history: list) -> str:
        if not chat_history:
            return ""
        lines = []
        for message in chat_history[-5:]:
            if isinstance(message, dict):
                role = "User" if message.get("role") == "user" else "CyberGuard"
                lines.append(f"{role}: {message.get('content', '')}")
        return "\n".join(lines)

    def _extract_contexts(self, docs) -> list:
        if not docs:
            return []
        contexts = []
        for doc in docs:
            if isinstance(doc, dict):
                contexts.append(doc.get("content", str(doc)))
            else:
                contexts.append(str(doc))
        return contexts

    async def get_response(self, query: str, chat_history: list = None) -> dict:
        user_query = query.strip()
        history_text = self._format_history(chat_history)
        docs = []

        try:
            trace = self.langfuse.trace(
                name="cyberguard-chat",
                input=user_query,
                metadata={"history_length": len(chat_history or [])}
            )
            print("TRACE ID:", trace.id)
        except Exception as e:
            print("LANGFUSE TRACE ERROR:", repr(e))
            trace = None

        # 1. GATE 1: Input Filtering
        if self._is_greeting(user_query):
            if trace:
                trace.update(output=GREETING_RESPONSE, metadata={"gate": "greeting"})
                self.langfuse.flush()
            return {
                "reply": GREETING_RESPONSE, "risk": 0, "findings": [],
                "trace_id": trace.id if trace else None,
                "contexts": []
            }

        if self._is_forbidden(user_query):
            if trace:
                trace.update(output=OUT_OF_SCOPE_RESPONSE, metadata={"gate": "forbidden_input"})
                self.langfuse.flush()
            return {
                "reply": OUT_OF_SCOPE_RESPONSE, "risk": 0, "findings": [],
                "trace_id": trace.id if trace else None,
                "contexts": []
            }

        # 2. GATE 2: Threat Analysis
        threat_span = trace.span(name="threat_analysis", input=user_query) if trace else None
        analysis = await self.analyzer.analyze(user_query)
        tech_flags = self._format_tech_flags(analysis)
        if threat_span:
            threat_span.end(output=analysis)

        # 3. GATE 3: Query Optimization
        rewrite_span = trace.span(name="query_rewrite", input=user_query) if trace else None
        rewritten = rewrite_query(self.llm, user_query)
        if rewrite_span:
            rewrite_span.end(output=rewritten)

        # 4. GATE 4: Retrieval
        retrieval_span = trace.span(name="retrieval", input=rewritten) if trace else None
        docs = retrieve_chunks(self.embeddings, self.supabase, rewritten)
        log_chunks(docs)
        if retrieval_span:
            retrieval_span.end(output={"num_docs": len(docs) if docs else 0, "docs": docs})

        # 5. GATE 5: Relevance Validation
        if not docs or not is_relevant(docs, user_query):
            if history_text and len(user_query.split()) < 10:
                fallback_gen = trace.generation(
                    name="fallback_generation",
                    model="gemini-2.5-flash",
                    input=user_query
                ) if trace else None
                reply = generate_fallback(self.llm, user_query, history_text)
                if fallback_gen:
                    fallback_gen.end(output=reply)
            else:
                if trace:
                    trace.update(output=NOT_FOUND_RESPONSE, metadata={"gate": "not_found"})
                    self.langfuse.flush()
                return {
                    "reply": NOT_FOUND_RESPONSE,
                    "risk": analysis.get("score", 15),
                    "findings": analysis.get("reasons", []),
                    "trace_id": trace.id if trace else None,
                    "contexts": self._extract_contexts(docs)
                }

            if self._is_forbidden(reply):
                if trace:
                    trace.update(output=NOT_FOUND_RESPONSE, metadata={"gate": "forbidden_fallback"})
                    self.langfuse.flush()
                return {
                    "reply": NOT_FOUND_RESPONSE, "risk": 15, "findings": [],
                    "trace_id": trace.id if trace else None,
                    "contexts": self._extract_contexts(docs)
                }

        # 6. GATE 6: Structured Generation
        context_text = format_context(docs)
        generation = trace.generation(
            name="main_generation",
            model="gemini-2.5-flash",
            input=user_query,
            metadata={"context": context_text, "tech_flags": tech_flags}
        ) if trace else None
        reply_text = generate_answer(
            self.llm,
            context_text,
            user_query,
            tech_flags,
            history_text
        )
        if generation:
            generation.end(output=reply_text)

        # 7. GATE 7: Output Guardrail
        if self._is_forbidden(reply_text) or "nasi" in reply_text.lower():
            if trace:
                trace.update(output=OUT_OF_SCOPE_RESPONSE, metadata={"gate": "output_blocked"})
                self.langfuse.flush()
            return {
                "reply": OUT_OF_SCOPE_RESPONSE, "risk": 0, "findings": [],
                "trace_id": trace.id if trace else None,
                "contexts": self._extract_contexts(docs)
            }

        if trace:
            trace.update(
                output=reply_text,
                metadata={"risk": analysis.get("score", 15), "findings": analysis.get("reasons", [])}
            )
            try:
                self.langfuse.flush()
            except Exception as e:
                print("LANGFUSE FLUSH ERROR:", repr(e))

        return {
            "reply": reply_text,
            "risk": analysis.get("score", 15),
            "findings": analysis.get("reasons", []),
            "trace_id": trace.id if trace else None,
            "contexts": self._extract_contexts(docs)
        }