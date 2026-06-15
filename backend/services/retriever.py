# ══════════════════════════════════════════════════════════════════════
#  Embedding query + ambil chunk relevan dari Supabase
# ══════════════════════════════════════════════════════════════════════

# Import retrieval configuration
from .constants import MATCH_THRESHOLD, MATCH_COUNT


# Retrieval chunk dari vector database
def retrieve_chunks(
    embeddings,
    supabase,
    query: str
) -> list[dict]:

    # Ubah query menjadi embedding vector
    query_embedding = embeddings.embed_query(query)

    # Semantic search menggunakan cosine similarity
    result = supabase.rpc(
        "match_documents",
        {

            # Vector query user
            "query_embedding": query_embedding,

            # Threshold similarity minimum
            "match_threshold": MATCH_THRESHOLD,

            # Jumlah chunk retrieval
            "match_count": MATCH_COUNT
        }

    ).execute()

    # Return retrieved chunk
    return result.data or []


# Debug retrieved chunk
def log_chunks(docs: list[dict]) -> None:

    # Print total chunk retrieval
    print(f"\n=== RETRIEVED {len(docs)} CHUNKS ===")

    # Loop seluruh chunk
    for i, doc in enumerate(docs, 1):

        # Ambil source metadata
        src = doc.get(
            "metadata",
            {}
        ).get("source", "?")

        # Print isi chunk
        print(
            f"[{i}] {src} — "
            f"{doc['content'][:150]}..."
        )

    print("=" * 40 + "\n")