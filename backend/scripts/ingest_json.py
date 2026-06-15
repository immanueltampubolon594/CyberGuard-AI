# Load library utama
import os
import sys
import json
import time
import hashlib

# Load environment variable
from dotenv import load_dotenv

# Embedding model Cohere
from langchain_cohere import CohereEmbeddings

# Vector database Supabase
from langchain_community.vectorstores import SupabaseVectorStore

# Struktur document LangChain
from langchain_core.documents import Document


# Tambahkan root project ke Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Import koneksi Supabase
from database.supabase_client import get_supabase

# Load file .env
load_dotenv()


# Generate unique ID document
def generate_id(record_id: str) -> str:
    return hashlib.md5(record_id.encode('utf-8')).hexdigest()


# Gabungkan field JSON menjadi text embedding
def record_to_text(record: dict) -> str:

    parts = []

    # Tambahkan topik
    if record.get("topik"):
        parts.append(f"Topik: {record['topik']}")

    # Tambahkan pertanyaan
    if record.get("pertanyaan"):
        parts.append(f"Pertanyaan: {record['pertanyaan']}")

    # Tambahkan analogi
    if record.get("analogi"):
        parts.append(f"Analogi: {record['analogi']}")

    # Tambahkan jawaban
    if record.get("jawaban"):
        parts.append(f"Jawaban: {record['jawaban']}")

    # Tambahkan studi kasus
    if record.get("studi_kasus"):
        parts.append(f"Studi Kasus: {record['studi_kasus']}")

    # Tambahkan referensi
    if record.get("referensi"):
        parts.append(f"Referensi: {record['referensi']}")

    # Gabungkan semua text
    return " | ".join(parts)


# Fungsi utama ingestion dataset
def ingest_json():

    print("Memulai ingestion dataset JSON ke Supabase...")

    # Path dataset JSON
    json_path = os.path.join(
        os.path.dirname(__file__),
        '..',
        'data',
        'cyberguard_dataset.json'
    )

    # Validasi file dataset
    if not os.path.exists(json_path):
        print(f"File tidak ditemukan: {json_path}")
        return

    # Load dataset JSON
    with open(json_path, 'r', encoding='utf-8') as f:
        dataset = json.load(f)

    print(f"Total record dataset: {len(dataset)}")

    # List document LangChain
    docs = []

    # List unique ID
    doc_ids = []

    # Konversi JSON ke Document
    for record in dataset:

        # Gabungkan field text
        text = record_to_text(record)

        # Skip jika kosong
        if not text.strip():
            continue

        # Buat document LangChain
        doc = Document(
            page_content=text,

            # Metadata document
            metadata={
                "id": record.get("id", ""),
                "sumber": record.get("sumber", ""),
                "topik": record.get("topik", ""),
                "pertanyaan": record.get("pertanyaan", ""),
            }
        )

        docs.append(doc)

        # Generate ID unik
        doc_ids.append(
            generate_id(record.get("id", text))
        )

    print(f"Total document siap ingest: {len(docs)}")

    # Setup embedding model
    embeddings = CohereEmbeddings(
        model="embed-multilingual-v3.0",
        cohere_api_key=os.getenv("COHERE_API_KEY")
    )

    # Koneksi Supabase
    supabase_client = get_supabase()

    # Ukuran batch ingestion
    batch_size = 20

    # Total document
    total = len(docs)

    print("Memulai batch ingestion...")

    # Proses ingestion per batch
    for i in range(0, total, batch_size):

        batch_docs = docs[i:i + batch_size]
        batch_ids = doc_ids[i:i + batch_size]

        print(
            f"Processing batch "
            f"{i+1}–{min(i+batch_size, total)} "
            f"dari {total}"
        )

        try:

            # Simpan embedding ke Supabase
            SupabaseVectorStore.from_documents(

                # Document batch
                batch_docs,

                # Embedding model
                embeddings,

                # Supabase client
                client=supabase_client,

                # Nama tabel vector database
                table_name="documents",

                # Function similarity search
                query_name="match_documents",

                # ID document
                ids=batch_ids
            )

            print("Batch berhasil di-ingest.")

            # Delay anti rate limit
            if i + batch_size < total:
                print("Menunggu 15 detik...")
                time.sleep(15)

        except Exception as e:

            print(f"Terjadi error batch {i}: {e}")

            # Retry delay
            print("Retry setelah 60 detik...")
            time.sleep(60)

            try:

                # Retry ingestion
                SupabaseVectorStore.from_documents(
                    batch_docs,
                    embeddings,
                    client=supabase_client,
                    table_name="documents",
                    query_name="match_documents",
                    ids=batch_ids
                )

                print("Retry berhasil.")

            except Exception as e2:

                print(f"Retry gagal: {e2}")
                continue

    # Status akhir ingestion
    print("=" * 50)
    print("SELESAI — Dataset berhasil di-ingest.")
    print("Vector database siap digunakan CyberGuard AI.")


# Entry point program
if __name__ == "__main__":
    ingest_json()

