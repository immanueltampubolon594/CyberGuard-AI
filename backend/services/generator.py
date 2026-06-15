# ══════════════════════════════════════════════════════════════════════
#  Generate jawaban via LLM: RAG answer + fallback dari chat history
# ══════════════════════════════════════════════════════════════════════

# Import prompt template
from langchain_core.prompts import PromptTemplate

# Import master prompt
from .constants import MASTER_PROMPT


# Generate jawaban utama berbasis RAG
def generate_answer(
    llm,
    context: str,
    question: str,
    tech_flags: str,
    chat_history: str
) -> str:

    # Buat prompt utama
    prompt = PromptTemplate.from_template(
        MASTER_PROMPT
    )

    # Gabungkan prompt dengan LLM
    chain = prompt | llm

    # Generate jawaban
    response = chain.invoke({

        # Context hasil retrieval
        "context": context,

        # Pertanyaan user
        "question": question,

        # Hasil threat analysis
        "tech_flags": tech_flags,

        # Riwayat percakapan
        "chat_history": chat_history,
    })

    # Return hasil jawaban
    return response.content.strip()


# Fallback jika retrieval gagal
def generate_fallback(
    llm,
    question: str,
    chat_history: str
) -> str:

    # Prompt fallback berbasis history
    fallback_prompt = f"""
Anda adalah CyberGuard Expert AI, asisten keamanan siber.

Riwayat percakapan sebelumnya:
{chat_history}

Pertanyaan user: {question}

Berdasarkan riwayat percakapan di atas, berikan jawaban yang relevan seputar keamanan siber.
Jawab dalam Bahasa Indonesia yang profesional dan ringkas.
Jangan keluar dari topik keamanan siber.
"""

    # Generate fallback response
    response = llm.invoke(fallback_prompt)

    # Return hasil fallback
    return response.content.strip()