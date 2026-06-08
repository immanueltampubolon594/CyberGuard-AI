# ══════════════════════════════════════════════════════════════════════
#  CYBERGUARD AI — CONTEXT FORMATTER
#  Bersihkan dan format chunk dari Supabase menjadi context string
# ══════════════════════════════════════════════════════════════════════

import re


def format_context(docs: list[dict]) -> str:
    """
    Bersihkan noise (label Chunk-N, dll) lalu gabungkan
    semua chunk menjadi satu string context untuk LLM.
    """
    parts = []
    for doc in docs:
        content = doc.get("content", "").strip()
        content = re.sub(r'\(Chunk-\d+(?:,\s*Chunk-\d+)*\)', '', content)
        content = re.sub(r'Chunk-\d+', '', content)
        content = re.sub(r'Penanganan/Penjelasan\s*:', 'Penjelasan:', content)
        content = re.sub(r'\s+', ' ', content).strip()
        parts.append(content)

    return "\n\n---\n\n".join(parts)