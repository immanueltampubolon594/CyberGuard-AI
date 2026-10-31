"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, Check, CheckCircle2, Landmark, RotateCcw, XCircle,
} from "lucide-react";
import {
  PASS_THRESHOLD,
  isCorrect,
  type Attempt,
  type SubmitOutcome,
} from "../../app/lib/learningApi";
import type { Message, Question } from "../../app/lib/quizzes";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

// ─────────────────────────── Bagian kecil ───────────────────────────

function MessageBox({ m }: { m: Message }) {
  return (
    <div className="mb-6 p-5 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.03]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl border border-slate-300 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-slate-300">
          <Landmark size={18} />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">{m.sender}</p>
          {m.time && <p className="text-[11px] text-slate-500">{m.time}</p>}
        </div>
      </div>
      <div className="space-y-2">
        {m.lines.map((line, i) => (
          <p key={i} className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed break-words">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

function Feedback({ q, correct }: { q: Question; correct: boolean }) {
  const points = Array.isArray(q.explanation) ? q.explanation : null;
  return (
    <div
      className={`mt-6 p-5 rounded-2xl border ${
        correct
          ? "border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/[0.06]"
          : "border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/[0.06]"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        {correct ? (
          <CheckCircle2 size={16} className="text-emerald-500" />
        ) : (
          <XCircle size={16} className="text-amber-500" />
        )}
        <p className="font-black text-slate-900 dark:text-white">
          {correct ? "Jawaban Benar!" : "Belum Tepat"}
        </p>
      </div>
      {q.type === "multi_select" && (
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
          {correct
            ? "Semua bagian yang kamu pilih memang mencurigakan."
            : "Periksa lagi pilihanmu. Bagian yang benar sudah ditandai di atas."}
        </p>
      )}
      <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-white/15 bg-white/60 dark:bg-black/20">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Penjelasan</p>
        {points ? (
          <ol className="space-y-2">
            {points.map((p, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                <span className="shrink-0 w-5 h-5 rounded-full border border-slate-300 dark:border-white/20 text-[10px] font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                {p}
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{q.explanation as string}</p>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────── Kartu soal ───────────────────────────

export function QuestionCard({
  q,
  selected,
  onChange,
  showResult = false,
  disabled = false,
}: {
  q: Question;
  selected: number[];
  onChange?: (next: number[]) => void;
  showResult?: boolean; // tampilkan benar/salah per pilihan
  disabled?: boolean;
}) {
  const multi = q.type === "multi_select";
  const correctSet = new Set(Array.isArray(q.correct) ? q.correct : [q.correct]);

  const toggle = (i: number) => {
    if (disabled || !onChange) return;
    if (multi) {
      onChange(selected.includes(i) ? selected.filter((x) => x !== i) : [...selected, i].sort());
    } else {
      onChange([i]);
    }
  };

  return (
    <div>
      <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-5 leading-snug">
        {q.prompt}
      </h2>
      {q.message && <MessageBox m={q.message} />}

      <div className="space-y-3">
        {q.options.map((opt, i) => {
          const isSel = selected.includes(i);
          const isRight = correctSet.has(i);
          let tone =
            "border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.02] hover:border-blue-400 dark:hover:border-blue-500/40";
          let tag: { text: string; cls: string } | null = null;

          if (showResult) {
            if (isRight) {
              tone = "border-emerald-400 dark:border-emerald-500/40 bg-emerald-50 dark:bg-emerald-500/[0.07]";
              tag = isSel
                ? { text: "Benar", cls: "text-emerald-600 dark:text-emerald-400 border-emerald-400/50" }
                : { text: multi ? "Terlewat" : "Jawaban benar", cls: "text-emerald-600 dark:text-emerald-400 border-emerald-400/50" };
            } else if (isSel) {
              tone = "border-red-400 dark:border-red-500/40 bg-red-50 dark:bg-red-500/[0.07]";
              tag = { text: "Salah", cls: "text-red-500 border-red-400/50" };
            }
          } else if (isSel) {
            tone = "border-blue-500 bg-blue-50 dark:bg-blue-600/10";
          }

          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => toggle(i)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl border text-left transition-all ${tone} ${
                disabled ? "cursor-default" : "cursor-pointer"
              }`}
            >
              {multi ? (
                <span
                  className={`w-5 h-5 shrink-0 rounded-md border flex items-center justify-center ${
                    isSel ? "bg-blue-600 border-blue-600 text-white" : "border-slate-400 dark:border-slate-600"
                  }`}
                >
                  {isSel && <Check size={13} strokeWidth={3} />}
                </span>
              ) : (
                <span
                  className={`w-7 h-7 shrink-0 rounded-full border text-xs font-black flex items-center justify-center ${
                    isSel ? "bg-blue-600 border-blue-600 text-white" : "border-slate-400 dark:border-slate-600 text-slate-500"
                  }`}
                >
                  {LETTERS[i]}
                </span>
              )}
              <span className="flex-1 text-sm font-semibold text-slate-800 dark:text-slate-200 break-words">{opt}</span>
              {tag && (
                <span className={`shrink-0 px-2 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-wider ${tag.cls}`}>
                  {tag.text}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────── Latihan dan Simulasi ───────────────────────

export function PracticeStage({
  questions,
  doneLabel,
  onDone,
  onPrev,
}: {
  questions: Question[];
  doneLabel: string;
  onDone: () => void;
  onPrev?: () => void;
}) {
  const [i, setI] = useState(0);
  const [sel, setSel] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);

  const q = questions[i];
  const last = i === questions.length - 1;
  const correct = isCorrect(q, sel);

  const next = () => {
    if (last) return onDone();
    setI(i + 1);
    setSel([]);
    setChecked(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        {onPrev ? (
          <button
            onClick={onPrev}
            className="flex items-center gap-2 text-[12px] font-black uppercase tracking-wider text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={14} /> Sebelumnya
          </button>
        ) : (
          <span />
        )}
        <span className="text-[11px] font-bold text-slate-500">
          Soal {i + 1} dari {questions.length}
        </span>
      </div>

      <div className="p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0c1322]">
        <QuestionCard q={q} selected={sel} onChange={setSel} showResult={checked} disabled={checked} />
        {checked && <Feedback q={q} correct={correct} />}

        <div className="mt-6 flex flex-wrap gap-3">
          {!checked ? (
            <button
              disabled={sel.length === 0}
              onClick={() => setChecked(true)}
              className="flex-1 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 text-white text-[12px] font-black uppercase tracking-wider transition-all"
            >
              Periksa Jawaban
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  setSel([]);
                  setChecked(false);
                }}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-slate-300 dark:border-white/15 text-slate-700 dark:text-slate-200 text-[12px] font-black uppercase tracking-wider hover:border-blue-500 transition-all"
              >
                <RotateCcw size={13} /> Coba Lagi
              </button>
              <button
                onClick={next}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[12px] font-black uppercase tracking-wider transition-all"
              >
                {last ? doneLabel : "Soal Berikutnya"} <ArrowRight size={14} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────── Quiz ─────────────────────────────

function ScoreRing({ percent }: { percent: number }) {
  const r = 54;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative w-44 h-44 mx-auto">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="10" className="stroke-slate-200 dark:stroke-slate-800" />
        <circle
          cx="60" cy="60" r={r} fill="none" strokeWidth="10" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - percent / 100)}
          className="stroke-blue-600 dark:stroke-blue-500 transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-3xl font-black text-slate-900 dark:text-white">{percent} / 100</p>
        <p className="text-[10px] font-black tracking-[3px] text-slate-500 mt-1">SKOR</p>
      </div>
    </div>
  );
}

function StatBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.03] text-center">
      <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
      <p className="text-[11px] text-slate-500 mt-1">{label}</p>
    </div>
  );
}

type Phase = "intro" | "running" | "result" | "review";

export function QuizStage({
  title,
  questions,
  attempts,
  onSubmit,
  onPrev,
}: {
  title: string;
  questions: Question[];
  attempts: Attempt[];
  onSubmit: (answers: Record<string, number[]>) => SubmitOutcome | { error: string };
  onPrev?: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [outcome, setOutcome] = useState<SubmitOutcome | null>(null);
  const [reviewOf, setReviewOf] = useState<Attempt | null>(null);
  const [error, setError] = useState("");

  const last = attempts.length ? attempts[attempts.length - 1] : null;
  const best = attempts.length ? attempts.reduce((a, b) => (b.percent >= a.percent ? b : a)) : null;
  const answeredCount = questions.filter((q) => (answers[q.id]?.length ?? 0) > 0).length;

  const start = () => {
    setAnswers({});
    setIdx(0);
    setOutcome(null);
    setError("");
    setPhase("running");
  };

  const submit = () => {
    const res = onSubmit(answers);
    if ("error" in res) return setError(res.error);
    setOutcome(res);
    setReviewOf(res.attempt);
    setPhase("result");
  };

  const shell = "max-w-2xl mx-auto";
  const card = "p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0c1322]";
  const primary =
    "flex items-center justify-center gap-2 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[12px] font-black uppercase tracking-wider transition-all";
  const outline =
    "flex items-center justify-center gap-2 py-3.5 rounded-xl border border-slate-300 dark:border-white/15 text-slate-700 dark:text-slate-200 text-[12px] font-black uppercase tracking-wider hover:border-blue-500 transition-all";

  // ── Intro ──
  if (phase === "intro") {
    return (
      <div className={shell}>
        {onPrev && (
          <button
            onClick={onPrev}
            className="mb-6 flex items-center gap-2 text-[12px] font-black uppercase tracking-wider text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={14} /> Sebelumnya
          </button>
        )}
        <div className={card}>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Quiz {title}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            {questions.length} soal pilihan ganda. Nilai minimal untuk lulus {Math.round(PASS_THRESHOLD * 100)}%.
            Semua soal harus dijawab sebelum dikirim.
          </p>

          {last && best && (
            <div className="mb-6 grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.03]">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Skor terakhir</p>
                <p className="text-xl font-black text-slate-900 dark:text-white">{last.percent} / 100</p>
              </div>
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.03]">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Skor terbaik</p>
                <p className="text-xl font-black text-slate-900 dark:text-white">
                  {best.percent} / 100{" "}
                  {best.passed && <span className="text-[10px] text-emerald-500 font-black">LULUS</span>}
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {last && (
              <button
                onClick={() => {
                  setReviewOf(last);
                  setPhase("review");
                }}
                className={`${outline} flex-1 px-4`}
              >
                Lihat Pembahasan
              </button>
            )}
            <button onClick={start} className={`${primary} flex-1 px-4`}>
              {last ? "Ulangi Quiz" : "Mulai Quiz"} <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Mengerjakan ──
  if (phase === "running") {
    const q = questions[idx];
    const isLast = idx === questions.length - 1;
    return (
      <div className={shell}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-bold text-slate-500">
            Soal {idx + 1} dari {questions.length}
          </span>
          <span className="text-[11px] font-bold text-slate-500">
            {answeredCount}/{questions.length} terjawab
          </span>
        </div>
        <div className="flex gap-1.5 mb-6">
          {questions.map((qq, i) => (
            <button
              key={qq.id}
              onClick={() => setIdx(i)}
              aria-label={`Soal ${i + 1}`}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                i === idx
                  ? "bg-blue-600"
                  : (answers[qq.id]?.length ?? 0) > 0
                  ? "bg-blue-300 dark:bg-blue-500/40"
                  : "bg-slate-200 dark:bg-slate-800"
              }`}
            />
          ))}
        </div>

        <div className={card}>
          <QuestionCard q={q} selected={answers[q.id] ?? []} onChange={(v) => setAnswers({ ...answers, [q.id]: v })} />
          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
          <div className="mt-6 flex gap-3">
            <button
              disabled={idx === 0}
              onClick={() => setIdx(idx - 1)}
              className={`${outline} px-6 disabled:opacity-40 disabled:hover:border-slate-300`}
            >
              <ArrowLeft size={13} /> Sebelumnya
            </button>
            {isLast ? (
              <button
                disabled={answeredCount < questions.length}
                onClick={submit}
                className={`${primary} flex-1 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500`}
              >
                Kirim Jawaban
              </button>
            ) : (
              <button onClick={() => setIdx(idx + 1)} className={`${primary} flex-1`}>
                Berikutnya <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Pembahasan ──
  if (phase === "review" && reviewOf) {
    return (
      <div className={shell}>
        <button
          onClick={() => setPhase(outcome ? "result" : "intro")}
          className="mb-6 flex items-center gap-2 text-[12px] font-black uppercase tracking-wider text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={14} /> Kembali
        </button>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Pembahasan Quiz</h2>
        <div className="space-y-6">
          {questions.map((q, i) => {
            const sel = reviewOf.answers[q.id] ?? [];
            return (
              <div key={q.id} className={card}>
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3">Soal {i + 1}</p>
                <QuestionCard q={q} selected={sel} showResult disabled />
                <Feedback q={q} correct={isCorrect(q, sel)} />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Hasil ──
  const att = outcome?.attempt ?? last;
  if (!att) return null;
  return (
    <div className={shell}>
      <div className={`${card} text-center`}>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">Quiz Selesai!</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Kamu telah menyelesaikan quiz {title}.</p>
        <ScoreRing percent={att.percent} />
        <p
          className={`mt-4 inline-block px-4 py-1.5 rounded-full border text-[11px] font-black uppercase tracking-wider ${
            att.passed
              ? "border-emerald-400/50 text-emerald-600 dark:text-emerald-400"
              : "border-amber-400/50 text-amber-600 dark:text-amber-400"
          }`}
        >
          {att.passed ? "Lulus" : "Belum lulus, coba ulangi"}
        </p>
        <div className="grid grid-cols-3 gap-3 mt-6">
          <StatBox value={att.score} label="Jawaban Benar" />
          <StatBox value={att.total - att.score} label="Jawaban Salah" />
          <StatBox value={att.total} label="Soal" />
        </div>
      </div>

      {outcome && outcome.moduleCompleted && (
        <div className="mt-5 p-5 rounded-2xl border border-blue-300 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/[0.06] text-center">
          <p className="text-sm font-bold text-blue-700 dark:text-blue-300">
            Semua materi, interaksi, dan quiz selesai. Progress modul 100%.
          </p>
        </div>
      )}

      {outcome && (
        <>
          <div className={`${card} mt-5`}>
            <h3 className="font-black text-slate-900 dark:text-white mb-4">Yang Sudah Kamu Pahami</h3>
            {outcome.understood.length ? (
              <ul className="space-y-2">
                {outcome.understood.map((c) => (
                  <li key={c} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0" /> {c}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">Belum ada konsep yang dikuasai penuh. Pelajari ulang lalu coba lagi.</p>
            )}
          </div>

          <div className="mt-5 p-6 md:p-8 rounded-3xl border border-dashed border-slate-300 dark:border-white/15">
            <h3 className="font-black text-slate-900 dark:text-white mb-4">Yang Perlu Dipelajari Lagi</h3>
            {outcome.toReview.length ? (
              <div className="space-y-3">
                {outcome.toReview.map((r) => (
                  <div key={r.concept} className="p-4 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.02]">
                    <p className="text-sm font-black text-slate-900 dark:text-white mb-1">{r.concept}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{r.note}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Hebat! Tidak ada konsep yang perlu diulang.</p>
            )}
          </div>
        </>
      )}

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button onClick={() => setPhase("review")} className={outline}>Lihat Pembahasan</button>
        <button onClick={start} className={outline}>Ulangi Quiz</button>
      </div>
      <Link
        href="/pembelajaran"
        className="mt-3 flex items-center justify-center py-3.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-[#020617] text-[12px] font-black uppercase tracking-wider hover:opacity-90 transition-all"
      >
        Kembali ke Pembelajaran
      </Link>
    </div>
  );
}
