# ══════════════════════════════════════════════════════════════════════
#  Validasi apakah chunk retrieval relevan dengan query user
# ══════════════════════════════════════════════════════════════════════

# Threshold minimum similarity score
RELEVANCE_THRESHOLD = 0.50

# Minimum jumlah chunk yang harus melewati threshold
MIN_RELEVANT_CHUNKS = 1


def is_relevant(docs: list[dict], query: str) -> bool:
    """
    Validasi relevansi chunk dengan dua lapis pengecekan:
    1. Similarity score dari vector search (primary)
    2. Keyword overlap sebagai fallback
    """

    if not docs:
        return False

    # ── Layer 1: Similarity Score (Primary) ──────────────────────────
    # Hitung berapa chunk yang melewati threshold similarity
    high_similarity_chunks = [
        doc for doc in docs
        if doc.get("similarity", 0.0) >= RELEVANCE_THRESHOLD
    ]

    if len(high_similarity_chunks) >= MIN_RELEVANT_CHUNKS:
        return True

    # ── Layer 2: Keyword Overlap (Fallback) ──────────────────────────
    # Ambil keyword penting dari query (lebih dari 3 huruf)
    stopwords = {
        "yang", "dengan", "untuk", "adalah", "pada", "dari", "tidak",
        "itu", "ini", "atau", "jika", "maka", "akan", "bisa", "cara",
        "apa", "bagaimana", "kenapa", "mengapa", "kapan", "siapa",
        "saat", "ketika", "setelah", "sebelum", "sudah", "belum",
    }

    keywords = [
        word for word in query.lower().split()
        if len(word) > 3 and word not in stopwords
    ]

    if not keywords:
        return False

    # Hitung overlap score per chunk
    for doc in docs:
        content_lower = doc.get("content", "").lower()
        matched = sum(1 for kw in keywords if kw in content_lower)
        overlap_score = matched / len(keywords)

        # Minimal 40% keyword harus ditemukan di salah satu chunk
        if overlap_score >= 0.4:
            return True

    return False