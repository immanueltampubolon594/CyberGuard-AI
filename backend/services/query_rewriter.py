# ══════════════════════════════════════════════════════════════════════
#  CYBERGUARD AI — QUERY REWRITER
#  Mengubah input user menjadi pertanyaan teknis untuk retrieval
# ══════════════════════════════════════════════════════════════════════


def rewrite_query(llm, query: str) -> str:
    """
    Ubah pertanyaan user menjadi query teknis singkat
    agar embedding retrieval lebih akurat.
    """
    rewrite_prompt = (
        "Ubah teks berikut menjadi pertanyaan teknis singkat "
        "seputar keamanan siber dalam Bahasa Indonesia.\n"
        "Jika sudah berbentuk pertanyaan teknis, kembalikan apa adanya.\n"
        f"Input: {query}\n"
        "Output (hanya pertanyaan singkat):"
    )
    response = llm.invoke(rewrite_prompt)
    return response.content.strip()