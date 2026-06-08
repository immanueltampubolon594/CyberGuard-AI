# ══════════════════════════════════════════════════════════════════════
#  CYBERGUARD AI — GENERATOR
#  Generate jawaban via LLM: RAG answer + fallback dari chat history
# ══════════════════════════════════════════════════════════════════════

from langchain_core.prompts import PromptTemplate
from .constants import MASTER_PROMPT


def generate_answer(llm, context: str, question: str,
                    tech_flags: str, chat_history: str) -> str:
    """
    Generate jawaban utama berdasarkan context dari database (RAG).
    """
    prompt   = PromptTemplate.from_template(MASTER_PROMPT)
    chain    = prompt | llm
    response = chain.invoke({
        "context"     : context,
        "question"    : question,
        "tech_flags"  : tech_flags,
        "chat_history": chat_history,
    })
    return response.content.strip()


def generate_fallback(llm, question: str, chat_history: str) -> str:
    """
    Fallback: jawab berdasarkan riwayat percakapan jika database
    tidak menemukan chunk yang relevan (LAYER 4 & LAYER 5.5).
    """
    fallback_prompt = f"""Anda adalah CyberGuard Expert AI, asisten keamanan siber.

Riwayat percakapan sebelumnya:
{chat_history}

Pertanyaan user: {question}

Berdasarkan riwayat percakapan di atas, berikan jawaban yang relevan seputar \
keamanan siber. Jawab dalam Bahasa Indonesia yang profesional dan ringkas. \
Jangan keluar dari topik keamanan siber."""

    response = llm.invoke(fallback_prompt)
    return response.content.strip()