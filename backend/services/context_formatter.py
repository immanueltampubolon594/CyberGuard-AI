# ══════════════════════════════════════════════════════════════════════
#  Bersihkan dan format chunk dari Supabase menjadi context string
# ══════════════════════════════════════════════════════════════════════

import re


def format_context(docs: list[dict]) -> str:
    """Bersihkan dan gabungkan retrieved chunk menjadi context string."""

    if not docs:
        return "Tidak ada konteks yang tersedia."

    parts = []

    for i, doc in enumerate(docs, 1):
        content = doc.get("content", "").strip()

        if not content:
            continue

        # Hapus label chunk
        content = re.sub(r'\(Chunk-\d+(?:,\s*Chunk-\d+)*\)', '', content)
        content = re.sub(r'Chunk-\d+', '', content)

        # Rapikan label penjelasan
        content = re.sub(r'Penanganan/Penjelasan\s*:', 'Penjelasan:', content)

        # Bersihkan spasi berlebih
        content = re.sub(r'\s+', ' ', content).strip()

        # Ambil metadata
        source = doc.get("metadata", {}).get("source", "unknown")
        similarity = doc.get("similarity", 0.0)

        # Format per chunk dengan header
        parts.append(
            f"[Dokumen {i} | Source: {source} | Similarity: {similarity:.2f}]\n"
            f"{content}"
        )

    return "\n\n---\n\n".join(parts) if parts else "Tidak ada konteks yang tersedia."