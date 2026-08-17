# ══════════════════════════════════════════════════════════════════════
#  Embedding query + ambil chunk relevan dari Supabase
# ══════════════════════════════════════════════════════════════════════

from .constants import MATCH_THRESHOLD, MATCH_COUNT


def retrieve_chunks(
    embeddings,
    supabase,
    query: str
) -> list[dict]:
    """Retrieve chunk relevan dari Supabase vector database."""

    # Embed query user
    query_embedding = embeddings.embed_query(query)

    # Semantic search via Supabase RPC
    result = supabase.rpc(
        "match_documents",
        {
            "query_embedding": query_embedding,
            "match_threshold": MATCH_THRESHOLD,
            "match_count": MATCH_COUNT,
        }
    ).execute()

    docs = result.data or []

    # Normalisasi field — pastikan semua chunk punya key 'content'
    normalized = []
    for doc in docs:
        content = (
            doc.get("content")
            or doc.get("text")
            or doc.get("chunk")
            or doc.get("page_content")
            or ""
        )
        normalized.append({
            "content": content,
            "metadata": doc.get("metadata", {}),
            "similarity": doc.get("similarity", 0.0),
        })

    return normalized


def log_chunks(docs: list[dict]) -> None:
    """Debug: print semua chunk yang berhasil diretrieve."""

    print(f"\n{'='*50}")
    print(f"RETRIEVED {len(docs)} CHUNKS")
    print(f"{'='*50}")

    if not docs:
        print("⚠️  KOSONG — tidak ada chunk yang diretrieve!")
        print("Kemungkinan: threshold terlalu tinggi atau query tidak relevan.")
        print(f"{'='*50}\n")
        return

    for i, doc in enumerate(docs, 1):
        similarity = doc.get("similarity", 0.0)
        source = doc.get("metadata", {}).get("source", "unknown")
        content_preview = doc.get("content", "")[:200]

        print(f"\n[Chunk {i}]")
        print(f"  Source     : {source}")
        print(f"  Similarity : {similarity:.4f}")
        print(f"  Preview    : {content_preview}...")

    print(f"\n{'='*50}\n")