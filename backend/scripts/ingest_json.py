import os
import sys
import json
import time
import hashlib
from dotenv import load_dotenv
from langchain_cohere import CohereEmbeddings
from langchain_community.vectorstores import SupabaseVectorStore
from langchain_core.documents import Document

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from database.supabase_client import get_supabase

load_dotenv()

def generate_id(record_id: str) -> str:
    """Buat hash unik berdasarkan ID record JSON"""
    return hashlib.md5(record_id.encode('utf-8')).hexdigest()

def record_to_text(record: dict) -> str:
    """
    Gabungkan semua field jadi 1 teks bersih untuk di-embed.
    Makin lengkap teksnya, makin akurat retrieval-nya.
    """
    parts = []

    if record.get("topik"):
        parts.append(f"Topik: {record['topik']}")

    if record.get("pertanyaan"):
        parts.append(f"Pertanyaan: {record['pertanyaan']}")

    if record.get("analogi"):
        parts.append(f"Analogi: {record['analogi']}")

    if record.get("jawaban"):
        parts.append(f"Jawaban: {record['jawaban']}")

    if record.get("studi_kasus"):
        parts.append(f"Studi Kasus: {record['studi_kasus']}")

    if record.get("referensi"):
        parts.append(f"Referensi: {record['referensi']}")

    return " | ".join(parts)

def ingest_json():
    print("Memulai Ingest JSON ke Supabase...")

    # ── Load JSON ──
    json_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'cyberguard_dataset.json')
    if not os.path.exists(json_path):
        print(f"File tidak ditemukan: {json_path}")
        return

    with open(json_path, 'r', encoding='utf-8') as f:
        dataset = json.load(f)

    print(f"Total record di JSON: {len(dataset)}")

    # ── Konversi ke LangChain Document ──
    docs = []
    doc_ids = []

    for record in dataset:
        text = record_to_text(record)
        if not text.strip():
            continue

        doc = Document(
            page_content=text,
            metadata={
                "id":         record.get("id", ""),
                "sumber":     record.get("sumber", ""),
                "topik":      record.get("topik", ""),
                "pertanyaan": record.get("pertanyaan", ""),
            }
        )
        docs.append(doc)
        doc_ids.append(generate_id(record.get("id", text)))

    print(f"📄 Total dokumen siap di-ingest: {len(docs)}")

    # ── Setup Embeddings & Supabase ──
    embeddings = CohereEmbeddings(
        model="embed-multilingual-v3.0",
        cohere_api_key=os.getenv("COHERE_API_KEY")
    )
    supabase_client = get_supabase()

    # ── Batch Ingest ──
    batch_size = 20
    total = len(docs)

    print(f"Mulai ingest dengan batch size {batch_size}...")

    for i in range(0, total, batch_size):
        batch_docs = docs[i:i + batch_size]
        batch_ids  = doc_ids[i:i + batch_size]

        print(f"⏳ Batch {i+1}–{min(i+batch_size, total)} dari {total}...")

        try:
            SupabaseVectorStore.from_documents(
                batch_docs,embeddings,
                client=supabase_client,
                table_name="documents",
                query_name="match_documents",
                ids=batch_ids
            )
            print(f"   ✅ Berhasil")

            # Jeda supaya tidak kena rate limit Cohere
            if i + batch_size < total:
                print("   Jeda 15 detik...")
                time.sleep(15)

        except Exception as e:
            print(f"   Error: {e}")
            print("   Coba lagi setelah 60 detik...")
            time.sleep(60)
            try:
                SupabaseVectorStore.from_documents(
                    batch_docs,
                    embeddings,
                    client=supabase_client,
                    table_name="documents",
                    query_name="match_documents",
                    ids=batch_ids
                )
                print(f"   Retry berhasil")
            except Exception as e2:
                print(f"   Retry gagal, skip batch ini: {e2}")
                continue

    print(f"\n{'='*50}")
    print(f"🏁 SELESAI! {total} dokumen telah di-ingest ke Supabase.")
    print(f"   Database siap digunakan oleh chatbot CyberGuard!")

if __name__ == "__main__":
    ingest_json()