# ══════════════════════════════════════════════════════════════════════
#  Mengubah input user menjadi pertanyaan teknis untuk retrieval
# ══════════════════════════════════════════════════════════════════════


# Rewrite query user untuk retrieval
def rewrite_query(llm, query: str) -> str:

    # Prompt rewrite query
    rewrite_prompt = (

        # Instruksi rewrite
        "Ubah teks berikut menjadi pertanyaan teknis singkat "

        # Fokus keamanan siber
        "seputar keamanan siber dalam Bahasa Indonesia.\n"

        # Jika sudah teknis jangan diubah
        "Jika sudah berbentuk pertanyaan teknis, kembalikan apa adanya.\n"

        # Input user
        f"Input: {query}\n"

        # Output query baru
        "Output (hanya pertanyaan singkat):"
    )

    # Generate rewritten query
    response = llm.invoke(rewrite_prompt)

    # Return hasil rewrite
    return response.content.strip()