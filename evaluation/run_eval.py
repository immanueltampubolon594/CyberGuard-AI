# ══════════════════════════════════════════════════════════════════════
#  CYBERGUARD AI — EVALUASI RAGAS
#  Jalankan dari folder evaluation:
#  python run_eval.py
# ══════════════════════════════════════════════════════════════════════

import json
import asyncio
import sys
import os

# Tambahkan path backend agar module bisa diimport
sys.path.append(
    os.path.abspath(
        os.path.join(
            os.path.dirname(__file__),
            '..',
            'backend'
        )
    )
)

# Load environment variable dari backend/.env
from dotenv import load_dotenv

load_dotenv(
    os.path.join(
        os.path.dirname(__file__),
        '..',
        'backend',
        '.env'
    )
)

# Import dataset HuggingFace
from datasets import Dataset

# Import evaluasi RAGAS
from ragas import evaluate
from ragas.metrics import BleuScore, RougeScore
from ragas.llms import llm_factory

# Import OpenAI client
from openai import OpenAI

# Import tabel terminal
from tabulate import tabulate


# ══════════════════════════════════════════════════════════════════════
#  SETUP LLM UNTUK RAGAS
# ══════════════════════════════════════════════════════════════════════

openai_client = OpenAI(

    # API Key HuggingFace
    api_key=os.getenv("HUGGINGFACE_API_KEY"),

    # Endpoint HuggingFace Router
    base_url="https://router.huggingface.co/v1"
)

# Gunakan model Qwen untuk evaluasi
ragas_llm = llm_factory(

    # Model evaluasi
    model="Qwen/Qwen3-14B:nscale",

    # Client OpenAI compatible
    client=openai_client
)


# ══════════════════════════════════════════════════════════════════════
#  MAIN PROGRAM
# ══════════════════════════════════════════════════════════════════════

async def main():

    # Header terminal
    print("=" * 70)
    print("           CYBERGUARD AI — EVALUASI RAGAS")
    print("=" * 70)

    # Load hasil mentah evaluasi
    with open(
        "hasil_mentah.json",
        encoding="utf-8"
    ) as f:

        results = json.load(f)

    # Hapus data error
    results = [
        r for r in results
        if r["answer"] != "Error"
    ]

    # Tampilkan jumlah data
    print(f"\n✓ Total data valid : {len(results)} pertanyaan")

    # Info proses evaluasi
    print("\n── Menjalankan evaluasi RAGAS... ──\n")

    # Convert ke format Dataset
    ragas_dataset = Dataset.from_list(results)

    # Jalankan evaluasi
    scores = evaluate(

        # Dataset evaluasi
        dataset=ragas_dataset,

        # Metric evaluasi
        metrics=[
            BleuScore(),
            RougeScore()
        ],

        # LLM evaluator
        llm=ragas_llm
    )

    # Convert hasil ke dataframe
    df = scores.to_pandas()

    # Tambahkan nomor urut
    df.insert(0, "No", range(1, len(df) + 1))

    # Ambil kolom penting saja untuk tabel terminal
    table_df = df[[
        "No",
        "bleu_score",
        "rouge_score(mode=fmeasure)"
    ]]

    # ══════════════════════════════════════════════════════════════════
    #  TAMPILKAN HASIL EVALUASI
    # ══════════════════════════════════════════════════════════════════

    print("=" * 70)
    print("                    HASIL EVALUASI")
    print("=" * 70)

    # Tampilkan tabel terminal
    print(
        tabulate(
            table_df,
            headers="keys",
            tablefmt="grid",
            showindex=False
        )
    )

    print("=" * 70)

    # ══════════════════════════════════════════════════════════════════
    #  HITUNG RATA-RATA SCORE
    # ══════════════════════════════════════════════════════════════════

    avg_bleu = df["bleu_score"].mean()
    avg_rouge = df["rouge_score(mode=fmeasure)"].mean()

    print("\nRATA-RATA SCORE")
    print("-" * 70)

    print(f"BLEU Score  : {avg_bleu:.4f}")
    print(f"ROUGE Score : {avg_rouge:.4f}")

    print("-" * 70)

    # ══════════════════════════════════════════════════════════════════
    #  SIMPAN HASIL KE CSV
    # ══════════════════════════════════════════════════════════════════

    df.to_csv(
       
        # Nama file output
        "hasil_evaluasi.csv",

        # Tanpa index pandas
        index=False,

        # Encoding UTF-8
        encoding="utf-8"
    )

    print("\n✓ Hasil evaluasi berhasil disimpan")
    print("✓ File : hasil_evaluasi.csv")

    print("\n" + "=" * 70)
    print("          EVALUASI RAGAS SELESAI")
    print("=" * 70)


# ══════════════════════════════════════════════════════════════════════
#  ENTRY POINT PROGRAM
# ══════════════════════════════════════════════════════════════════════

if __name__ == "__main__":

    asyncio.run(main())