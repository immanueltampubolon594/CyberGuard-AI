# ══════════════════════════════════════════════════════════════════════
#  Mengubah input user menjadi pertanyaan teknis untuk retrieval
# ══════════════════════════════════════════════════════════════════════


def rewrite_query(llm, query: str) -> str:
    """
    Query original dikembalikan langsung tanpa rewrite.
    Cohere embedding sudah cukup pintar menangani bahasa natural.
    """
    return query.strip()