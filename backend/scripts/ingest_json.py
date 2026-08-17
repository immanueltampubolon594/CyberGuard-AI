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

def generate_id(text: str) -> str:
    return hashlib.md5(text.encode('utf-8')).hexdigest()

def record_to_text(record: dict) -> str:
    # --- LOGIKA BARU: MENANGANI DUA FORMAT SEKALIGUS ---
    
    # 1. Jika formatnya adalah materi panjang (field 'konten')
    if record.get("konten"):
        return record["konten"].strip()
    
    # 2. Jika formatnya adalah Q&A (field pertanyaan, jawaban, dll)
    parts = []
    if record.get("topik"): parts.append(f"Topik: {record['topik']}")
    if record.get("pertanyaan"): parts.append(f"Pertanyaan: {record['pertanyaan']}")
    if record.get("analogi"): parts.append(f"Analogi: {record['analogi']}")
    if record.get("jawaban"): parts.append(f"Jawaban: {record['jawaban']}")
    if record.get("studi_kasus"): parts.append(f"Studi Kasus: {record['studi_kasus']}")
    if record.get("penyelesaian"): parts.append(f"Penyelesaian: {record['penyelesaian']}")
    if record.get("referensi"): parts.append(f"Referensi: {record['referensi']}")
    
    return " | ".join(parts)

def ingest_json():
    print("🚀 Memulai Integrasi Dataset Multi-Format (Anti-Duplikat)...")

    json_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'cyberguard_dataset.json')

    if not os.path.exists(json_path):
        print(f"❌ File tidak ditemukan: {json_path}")
        return

    with open(json_path, 'r', encoding='utf-8') as f:
        dataset = json.load(f)

    if len(dataset) > 0 and isinstance(dataset[0], list):
        dataset = [item for sublist in dataset for item in sublist]

    docs = []
    doc_ids = []
    seen_content = set()

    for record in dataset:
        if not isinstance(record, dict): continue
        
        # Mengubah record menjadi teks berdasarkan formatnya
        text = record_to_text(record)
        
        if not text.strip() or text in seen_content:
            continue

        doc_id = generate_id(text)
        docs.append(Document(page_content=text, metadata={"sumber": record.get("sumber", "JSON_DATA")}))
        doc_ids.append(doc_id)
        seen_content.add(text)

    print(f"🎯 Berhasil memproses {len(docs)} data unik.")

    embeddings = CohereEmbeddings(model="embed-multilingual-v3.0")
    supabase_client = get_supabase()
    
    total = len(docs)
    batch_size = 15 # Batch kecil agar aman dari error SSL

    for i in range(0, total, batch_size):
        batch_docs = docs[i:i + batch_size]
        batch_ids = doc_ids[i:i + batch_size]

        print(f"⏳ Mengirim batch {i+1} dari {total}...")
        try:
            SupabaseVectorStore.from_documents(
                batch_docs, embeddings, client=supabase_client,
                table_name="documents", query_name="match_documents", ids=batch_ids
            )
            print("✅ Sukses.")
            time.sleep(25) # Jeda agar tidak kena Rate Limit Trial
        except Exception as e:
            print(f"⚠️ Gagal di batch {i}, istirahat 60 detik...")
            time.sleep(60)
            # Retry
            SupabaseVectorStore.from_documents(batch_docs, embeddings, client=supabase_client, table_name="documents", query_name="match_documents", ids=batch_ids)

    print("🏁 DATASET MULTI-FORMAT BERHASIL DISINKRONKAN.")

if __name__ == "__main__":
    ingest_json()