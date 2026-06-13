# ══════════════════════════════════════════════════════════════════════
#  Bersihkan dan format chunk dari Supabase menjadi context string
# ══════════════════════════════════════════════════════════════════════

# Import regex
import re


# Bersihkan dan gabungkan retrieved chunk
def format_context(docs: list[dict]) -> str:

    # Simpan seluruh chunk
    parts = []

    # Loop semua retrieved chunk
    for doc in docs:

        # Ambil isi chunk
        content = doc.get("content", "").strip()

        # Hapus label chunk
        content = re.sub(
            r'\(Chunk-\d+(?:,\s*Chunk-\d+)*\)',
            '',
            content
        )

        # Hapus sisa chunk label
        content = re.sub(
            r'Chunk-\d+',
            '',
            content
        )

        # Rapikan label penjelasan
        content = re.sub(
            r'Penanganan/Penjelasan\s*:',
            'Penjelasan:',
            content
        )

        # Bersihkan spasi berlebih
        content = re.sub(
            r'\s+',
            ' ',
            content
        ).strip()

        # Tambahkan ke list
        parts.append(content)

    # Gabungkan semua chunk
    return "\n\n---\n\n".join(parts)