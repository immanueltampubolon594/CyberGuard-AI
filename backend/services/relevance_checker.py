# ══════════════════════════════════════════════════════════════════════
#  CYBERGUARD AI — RELEVANCE CHECKER
#  Validasi apakah chunk yang ter-retrieve benar-benar relevan
#  dengan pertanyaan user (LAYER 5.5)
# ══════════════════════════════════════════════════════════════════════


def is_relevant(docs: list[dict], query: str) -> bool:
    """
    Cek apakah minimal satu chunk mengandung kata kunci
    dari query user (kata dengan panjang > 4 huruf).

    Returns True jika relevan, False jika tidak ada kecocokan.
    """
    keywords = [word for word in query.lower().split() if len(word) > 4]

    return any(
        any(keyword in doc.get("content", "").lower() for keyword in keywords)
        for doc in docs
    )