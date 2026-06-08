# ══════════════════════════════════════════════════════════════════════
#  CYBERGUARD AI — EVALUASI RAGAS
#  Jalankan dari folder evaluation: python run_eval.py
# ══════════════════════════════════════════════════════════════════════

import json
import asyncio
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', 'backend', '.env'))

from datasets import Dataset
from ragas import evaluate
from ragas.metrics import BleuScore, RougeScore
from ragas.llms import llm_factory
from openai import OpenAI


# ── Setup LLM untuk RAGAS ─────────────────────────────────────────────
openai_client = OpenAI(
    api_key=os.getenv("HUGGINGFACE_API_KEY"),
    base_url="https://router.huggingface.co/v1"
)

ragas_llm = llm_factory(
    model="Qwen/Qwen3-14B:nscale",
    client=openai_client
)


# ── Main ──────────────────────────────────────────────────────────────
async def main():
    print("=" * 60)
    print("  CYBERGUARD AI — EVALUASI RAGAS")
    print("=" * 60)

    # Load dari hasil mentah yang sudah ada
    with open("hasil_mentah.json", encoding="utf-8") as f:
        results = json.load(f)

    # Filter yang error
    results = [r for r in results if r["answer"] != "Error"]
    print(f"\n✓ Data loaded: {len(results)} pertanyaan valid\n")

    # Evaluasi dengan RAGAS
    print("── Menjalankan evaluasi RAGAS... ──")
    ragas_dataset = Dataset.from_list(results)

    scores = evaluate(
        dataset=ragas_dataset,
        metrics=[
            BleuScore(),
            RougeScore()
        ],
        llm=ragas_llm
    )

    # Tampilkan hasil
    print("\n" + "=" * 60)
    print("  HASIL EVALUASI")
    print("=" * 60)
    df = scores.to_pandas()
    print(df.to_string())
    print("=" * 60)

    # Simpan ke CSV
    df.to_csv("hasil_evaluasi.csv", index=False, encoding="utf-8")
    print(f"\n✓ Hasil evaluasi disimpan ke hasil_evaluasi.csv")


if __name__ == "__main__":
    asyncio.run(main())