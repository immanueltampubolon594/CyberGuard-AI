    import os
    import sys 
    import time
    import hashlib # Library untuk membuat sidik jari unik
    from dotenv import load_dotenv
    from langchain_community.document_loaders import PyPDFLoader, DirectoryLoader
    from langchain_text_splitters import RecursiveCharacterTextSplitter
    from langchain_cohere import CohereEmbeddings
    from langchain_community.vectorstores import SupabaseVectorStore

    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
    from database.supabase_client import get_supabase

    load_dotenv()

    def generate_content_hash(text):
        """Fungsi untuk membuat ID unik berdasarkan isi teks materi"""
        return hashlib.md5(text.encode('utf-8')).hexdigest()

    def ingest_all_datasheets():
        print("Memulai proses Ingestion Masal (Anti-Duplikat)...")
        
        data_folder = "data/"
        if not os.path.exists(data_folder):
            print(f" Folder {data_folder} tidak ditemukan!")
            return

        loader = DirectoryLoader(data_folder, glob="**/*.pdf", loader_cls=PyPDFLoader)
        raw_documents = loader.load()
        print(f" Berhasil memuat total {len(raw_documents)} halaman.")

        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)
        docs = text_splitter.split_documents(raw_documents)

        # --- BAGIAN 1: DEDUPLIKASI LOKAL (Logika kamu) ---
        seen_chunks = set()
        unique_docs = []
        for doc in docs:
            text = doc.page_content.strip()
            if text not in seen_chunks:
                seen_chunks.add(text)
                unique_docs.append(doc)
        
        docs = unique_docs
        total_chunks = len(docs)
        print(f"✂️ Materi dipecah menjadi {total_chunks} bagian unik (Duplikat lokal dibuang).")

        embeddings = CohereEmbeddings(
            model="embed-multilingual-v3.0",
            cohere_api_key=os.getenv("COHERE_API_KEY")
        )
        supabase_client = get_supabase()

        # --- BAGIAN 2: BATCHING & UPSERT (Pencegahan di Database) ---
        batch_size = 20 
        print(f"Memulai sinkronisasi ke database (Batch Size: {batch_size})...")
        
        for i in range(0, total_chunks, batch_size):
            batch = docs[i : i + batch_size]
            
            # Buat daftar ID unik (Hash) untuk setiap potongan teks di batch ini
            # Ini akan digunakan Supabase untuk mendeteksi apakah data sudah ada atau belum
            batch_ids = [generate_content_hash(d.page_content) for d in batch]

            print(f"Mengirim batch {i}...")
            
            try:
                # Menggunakan .from_documents dengan parameter 'ids'
                # SupabaseVectorStore akan melakukan UPSERT secara otomatis berdasarkan ID ini
                SupabaseVectorStore.from_documents(
                    batch,
                    embeddings,
                    client=supabase_client,
                    table_name="documents",
                    query_name="match_documents",
                    ids=batch_ids # Mengunci data agar tidak duplikat di DB
                )
                print(f"Batch {i} sukses.")
                
                if i + batch_size < total_chunks:
                    print("Jeda 60 detik (Rate Limit Management)...")
                    time.sleep(60) 
                    
            except Exception as e:
                print(f"Error pada batch {i}: {e}")
                break

        print(f"SELESAI! Database Anda sekarang bersih dan up-to-date.")

    if __name__ == "__main__":
        ingest_all_datasheets()