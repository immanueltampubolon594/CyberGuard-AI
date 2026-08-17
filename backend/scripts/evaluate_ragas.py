"""
evaluate_ragas.py
Jalankan dari folder backend/:
    python scripts/evaluate_ragas.py

Hasil:
  - Skor RAGAS tampil di terminal
  - File hasil_evaluasi_ragas.xlsx tersimpan di backend/
  - Skor per pertanyaan ter-push ke dashboard Langfuse (kolom Scores)
"""

import asyncio
import json
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from services.rag_service import CyberGuardRAG
from langfuse import Langfuse
from datasets import Dataset
from ragas import evaluate
from ragas.metrics import faithfulness, answer_relevancy, context_precision, context_recall
from ragas.llms import LangchainLLMWrapper
from ragas.embeddings import LangchainEmbeddingsWrapper
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_cohere import CohereEmbeddings

# ─── Konfigurasi ──────────────────────────────────────────────────────────────

DATASET_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "eval_dataset.json")
OUTPUT_PATH  = os.path.join(os.path.dirname(__file__), "..", "hasil_evaluasi_ragas.xlsx")

# ─── Setup RAGAS pakai Gemini 2.5 Flash (evaluator) + Cohere (embeddings) ────

def get_ragas_llm():
    return LangchainLLMWrapper(ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=os.getenv("GOOGLE_API_KEY"),
        temperature=0,
    ))

def get_ragas_embeddings():
    return LangchainEmbeddingsWrapper(CohereEmbeddings(
        model="embed-multilingual-v3.0",
        cohere_api_key=os.getenv("COHERE_API_KEY"),
    ))

# ─── Main ─────────────────────────────────────────────────────────────────────

async def run_evaluation():
    print("=" * 60)
    print("CyberGuard AI — Evaluasi RAGAS (Gemini 2.5 Flash + Cohere)")
    print("=" * 60)

    with open(DATASET_PATH, "r", encoding="utf-8") as f:
        test_data = json.load(f)
    print(f"[INFO] Dataset: {len(test_data)} pertanyaan\n")

    rag = CyberGuardRAG()
    langfuse = Langfuse(
        public_key=os.getenv("LANGFUSE_PUBLIC_KEY"),
        secret_key=os.getenv("LANGFUSE_SECRET_KEY"),
        host=os.getenv("LANGFUSE_HOST"),
    )

    questions     = []
    answers       = []
    contexts_list = []
    ground_truths = []
    trace_ids     = []

    for i, item in enumerate(test_data, 1):
        question     = item["question"]
        ground_truth = item.get("ground_truth", "")

        print(f"[{i:02d}/{len(test_data)}] {question[:60]}...")

        # Retry sampai 3x kalau rate limit Groq
        for attempt in range(3):
            try:
                result = await rag.get_response(question, chat_history=[])
                answer   = result.get("reply", "")
                contexts = result.get("contexts", [])
                trace_id = result.get("trace_id")

                if not contexts:
                    contexts = ["Tidak ada konteks yang ditemukan."]

                questions.append(question)
                answers.append(answer)
                contexts_list.append(contexts)
                ground_truths.append(ground_truth)
                trace_ids.append(trace_id)

                print(f"         ✓ {answer[:80]}...")
                break

            except Exception as e:
                err = str(e)
                if "rate_limit" in err.lower() or "429" in err:
                    wait = 65
                    print(f"         ⚠ Rate limit Groq, tunggu {wait}s... (attempt {attempt+1}/3)")
                    await asyncio.sleep(wait)
                else:
                    print(f"         ✗ Error: {repr(e)}")
                    questions.append(question)
                    answers.append("ERROR")
                    contexts_list.append(["Error."])
                    ground_truths.append(ground_truth)
                    trace_ids.append(None)
                    break
        else:
            questions.append(question)
            answers.append("RATE_LIMIT")
            contexts_list.append(["Rate limit exceeded."])
            ground_truths.append(ground_truth)
            trace_ids.append(None)

        await asyncio.sleep(3)

    # ─── RAGAS Evaluation pakai Gemini ────────────────────────────────────────
    print("\n" + "=" * 60)
    print("Menjalankan evaluasi RAGAS dengan Gemini 2.5 Flash...")
    print("=" * 60)

    ragas_llm = get_ragas_llm()
    ragas_emb = get_ragas_embeddings()

    metrics = [faithfulness, answer_relevancy, context_precision, context_recall]
    for m in metrics:
        m.llm = ragas_llm
        if hasattr(m, "embeddings"):
            m.embeddings = ragas_emb

    dataset = Dataset.from_dict({
        "question":     questions,
        "answer":       answers,
        "contexts":     contexts_list,
        "ground_truth": ground_truths,
    })

    result = evaluate(dataset, metrics=metrics)
    df = result.to_pandas()

    print("\n── Hasil per pertanyaan ──")
    cols = ["question", "faithfulness", "answer_relevancy", "context_precision", "context_recall"]
    print(df[cols].to_string(index=False))

    print("\n── Rata-rata keseluruhan ──")
    metric_names = ["faithfulness", "answer_relevancy", "context_precision", "context_recall"]
    for m in metric_names:
        print(f"  {m:<25} : {df[m].mean():.4f}")

    # ─── Push ke Langfuse ─────────────────────────────────────────────────────
    print("\n" + "=" * 60)
    print("Mengirim skor ke Langfuse...")
    print("=" * 60)

    pushed = 0
    for idx, trace_id in enumerate(trace_ids):
        if not trace_id:
            continue
        try:
            for m in metric_names:
                val = df.loc[idx, m]
                if val is not None and str(val) != "nan":
                    langfuse.score(trace_id=trace_id, name=m, value=float(val))
            pushed += 1
        except Exception as e:
            print(f"  [WARN] Gagal push trace {trace_id}: {repr(e)}")

    langfuse.flush()
    print(f"  ✓ {pushed} trace berhasil dikirim ke Langfuse")

    # ─── Simpan Excel ─────────────────────────────────────────────────────────
    df.to_excel(OUTPUT_PATH, index=False)
    print(f"\n✅ Selesai! Hasil: {OUTPUT_PATH}")
    print("✅ Cek Langfuse → Tracing → klik trace → tab Scores")


if __name__ == "__main__":
    asyncio.run(run_evaluation())