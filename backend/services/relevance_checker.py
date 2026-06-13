# ══════════════════════════════════════════════════════════════════════
#  Validasi apakah chunk retrieval relevan dengan query user
# ══════════════════════════════════════════════════════════════════════


# Validasi relevansi chunk retrieval
def is_relevant(
    docs: list[dict],
    query: str
) -> bool:

    # Ambil keyword query
    keywords = [

        word

        for word in query.lower().split()

        # Ambil kata dengan panjang > 4
        if len(word) > 4
    ]

    # Cek apakah keyword ada di chunk retrieval
    return any(

        any(
            keyword in doc.get("content", "").lower()

            for keyword in keywords
        )

        for doc in docs
    )