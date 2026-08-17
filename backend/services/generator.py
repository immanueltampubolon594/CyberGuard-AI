# ══════════════════════════════════════════════════════════════════════
#  Generate jawaban via LLM: RAG answer + fallback dari chat history
# ══════════════════════════════════════════════════════════════════════

from langchain_core.prompts import PromptTemplate
from .constants import MASTER_PROMPT


def generate_answer(
    llm,
    context: str,
    question: str,
    tech_flags: str,
    chat_history: str
) -> str:

    print("\n" + "═"*60)
    print("CONTEXT MASUK KE LLM:")
    print(context[:500] if context else "⚠️ KOSONG!")
    print("═"*60 + "\n")

    prompt = PromptTemplate.from_template(MASTER_PROMPT)
    chain = prompt | llm

    response = chain.invoke({
        "context": context,
        "question": question,
        "tech_flags": tech_flags,
        "chat_history": chat_history,
    })

    return response.content.strip()


def generate_fallback(
    llm,
    question: str,
    chat_history: str
) -> str:

    fallback_prompt = f"""Kamu adalah CyberGuard AI, asisten edukatif keamanan siber.

═══════════════════════════════════════════════
ATURAN MUTLAK:
═══════════════════════════════════════════════
1. Jawab hanya seputar topik keamanan siber.
2. Gunakan riwayat percakapan sebagai konteks tambahan jika relevan.
3. Jika pertanyaan di luar keamanan siber, tolak dengan sopan.
4. Jawaban maksimal 4 kalimat. Bahasa Indonesia yang profesional.
5. DILARANG menambahkan informasi di luar riwayat percakapan.

[RIWAYAT PERCAKAPAN]:
{chat_history}

[PERTANYAAN USER]:
{question}

[JAWABAN CYBERGUARD]:"""

    response = llm.invoke(fallback_prompt)
    return response.content.strip()