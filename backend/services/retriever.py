# ══════════════════════════════════════════════════════════════════════
#  CYBERGUARD AI — RETRIEVER
#  Embedding query + ambil chunk relevan dari Supabase
# ══════════════════════════════════════════════════════════════════════

from .constants import MATCH_THRESHOLD, MATCH_COUNT


def retrieve_chunks(embeddings, supabase, query: str) -> list[dict]:
    """
    Embed query lalu ambil chunk paling relevan dari Supabase
    menggunakan cosine similarity.
    """
    query_embedding = embeddings.embed_query(query)
    result = supabase.rpc("match_documents", {
        "query_embedding": query_embedding,
        "match_threshold": MATCH_THRESHOLD,
        "match_count"    : MATCH_COUNT
    }).execute()

    return result.data or []


def log_chunks(docs: list[dict]) -> None:
    """Debug log — tampilkan chunk yang ter-retrieve (hapus di production)."""
    print(f"\n=== RETRIEVED {len(docs)} CHUNKS ===")
    for i, doc in enumerate(docs, 1):
        src = doc.get("metadata", {}).get("source", "?")
        print(f"[{i}] {src} — {doc['content'][:150]}...")
    print("=" * 40 + "\n")