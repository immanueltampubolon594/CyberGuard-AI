"use client";

// Quiz gaya ujian (mengikuti pola LMS Moodle):
// 1. Halaman awal  2. Mengerjakan (satu soal per halaman)
// 3. Ringkasan sebelum dikirim  4. Hasil + pembahasan.
// Jawaban baru dinilai setelah dikirim. Penyimpanan tetap lewat onSubmit (learningApi).
// Saat mengerjakan, quiz tampil layar penuh (mode ujian): navbar, sidebar, dan Tanya AI tertutup.

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, Clock, Flag, Moon, Sun } from "lucide-react";
import {
  PASS_THRESHOLD,
  isCorrect,
  summarizeConcepts,
  type Attempt,
  type SubmitOutcome,
} from "../../app/lib/learningApi";
import type { Message, Question } from "../../app/lib/quizzes";

const LETTERS = ["A", "B", "C", "D", "E", "F"];
const MINUTES_PER_QUESTION = 1; // batas waktu: 1 menit per soal (20 soal = 20 menit)
const MIN_MINUTES = 10;         // batas waktu paling sedikit

type Phase = "intro" | "attempt" | "summary" | "review";

// ── Format waktu ──
const fmtDate = (t?: number) =>
  t
    ? new Date(t).toLocaleString("id-ID", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : "-";
const fmtDuration = (ms: number) => {
  const s = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(s / 60);
  return m ? `${m} menit ${s % 60} detik` : `${s} detik`;
};
const fmtClock = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

// ── Pesan tiruan (email/chat) di atas pilihan, untuk soal skenario ──
function MessageView({ m }: { m: Message }) {
  return (
    <div className="mb-4 p-4 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0b1224]">
      <div className="flex items-center gap-3 pb-3 mb-3 border-b border-slate-200 dark:border-white/[0.06]">
        <div className="w-9 h-9 rounded-full grid place-items-center bg-slate-100 dark:bg-white/[0.06] text-sm font-black text-slate-500">
          {m.sender.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{m.sender}</p>
          {m.time && <p className="text-[11px] text-slate-500">{m.time}</p>}
        </div>
      </div>
      {m.lines.map((l, i) => (
        <p key={i} className="text-sm text-slate-700 dark:text-slate-300 my-1.5 break-words">{l}</p>
      ))}
    </div>
  );
}

// ── Kelas Tailwind yang dipakai berulang ──
const card = "rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0c1322]";
const btnPrimary =
  "px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[12px] font-black uppercase tracking-wider transition-all";
const btnOutline =
  "px-5 py-3 rounded-xl border border-slate-300 dark:border-white/15 text-slate-700 dark:text-slate-200 text-[12px] font-black uppercase tracking-wider hover:border-blue-500 transition-all";
const linkBtn = "text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-30 disabled:no-underline";

export function ExamQuiz({
  title,
  questions,
  attempts,
  onSubmit,
  onPrev,
}: {
  title: string;
  questions: Question[];
  attempts: Attempt[];
  onSubmit: (answers: Record<string, number[]>, startedAt: number) => SubmitOutcome | { error: string };
  onPrev?: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [startedAt, setStartedAt] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [outcome, setOutcome] = useState<SubmitOutcome | null>(null);
  const [error, setError] = useState("");
  const [leaveWarn, setLeaveWarn] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const focusRef = useRef<HTMLDivElement>(null);

  const last = attempts.length ? attempts[attempts.length - 1] : null;
  const best = attempts.length ? attempts.reduce((a, b) => (b.percent >= a.percent ? b : a)) : null;
  const isAnswered = (q: Question) => (answers[q.id]?.length ?? 0) > 0;
  const answeredCount = questions.filter(isAnswered).length;

  // ── Timer: berjalan selama mengerjakan / ringkasan ──
  const timeLimitMin = Math.max(MIN_MINUTES, Math.ceil(questions.length * MINUTES_PER_QUESTION));
  const deadline = startedAt + timeLimitMin * 60_000;
  const remaining = deadline - now;
  const running = phase === "attempt" || phase === "summary";

  // Simpan jawaban terbaru di ref, supaya kirim otomatis saat waktu habis memakai data terbaru.
  const answersRef = useRef(answers);
  answersRef.current = answers;

  const submit = () => {
    setConfirmOpen(false);
    const res = onSubmit(answersRef.current, startedAt);
    if ("error" in res) return setError(res.error);
    setOutcome(res);
    setPhase("review");
    scrollTop();
  };

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [running]);

  useEffect(() => {
    if (running && remaining <= 0) submit(); // waktu habis: kirim otomatis
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, remaining]);

  // ── Mode ujian: kunci halaman selama mengerjakan ──
  useEffect(() => {
    if (!running) return;
    // 1. Halaman di belakang tidak bisa di-scroll
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // 2. Peringatan bawaan browser saat refresh / tutup tab
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    // 3. Tombol Back browser: tetap di halaman ujian dan tampilkan peringatan
    window.history.pushState({ examGuard: true }, "");
    const onPopState = () => {
      window.history.pushState({ examGuard: true }, "");
      setLeaveWarn(true);
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    window.addEventListener("popstate", onPopState);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("popstate", onPopState);
      if (window.history.state?.examGuard) window.history.back(); // buang entri penjaga
    };
  }, [running]);

  // ── Tema terang/gelap (dipakai tombol di bilah mode ujian) ──
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, [phase]);
  const toggleTheme = () => {
    const nextDark = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", nextDark);
    localStorage.setItem("theme", nextDark ? "dark" : "light");
    setIsDark(nextDark);
  };

  const scrollTop = () => {
    focusRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const start = () => {
    setAnswers({});
    setFlags({});
    setIdx(0);
    setOutcome(null);
    setError("");
    setStartedAt(Date.now());
    setNow(Date.now());
    setPhase("attempt");
  };

  // Buka pembahasan percobaan lama dari tabel riwayat
  const openPastReview = (att: Attempt) => {
    setFlags({});
    setOutcome({ attempt: att, moduleCompleted: false, ...summarizeConcepts(questions, att.answers) });
    setPhase("review");
    scrollTop();
  };

  const goTo = (i: number) => {
    setIdx(i);
    setPhase("attempt");
    scrollTop();
  };

  const choose = (q: Question, k: number) => {
    const cur = answers[q.id] ?? [];
    const next =
      q.type === "multi_select"
        ? cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k].sort()
        : [k];
    setAnswers({ ...answers, [q.id]: next });
  };

  // ───────────────────────── Panel navigasi (kanan) ─────────────────────────
  const navPanel = (mode: "attempt" | "review") => {
    const reviewAnswers = outcome?.attempt.answers ?? {};
    return (
      <div className={`${card} p-4 lg:sticky lg:top-20`}>
        <h3 className="text-sm font-black text-slate-900 dark:text-white mb-3">Navigasi Quiz</h3>
        {mode === "attempt" && (
          <div className="flex items-center justify-between mb-4 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.03]">
            <span className="flex items-center gap-1.5 text-xs text-slate-500"><Clock size={13} /> Sisa waktu</span>
            <span className={`text-base font-black tabular-nums ${remaining < 60_000 ? "text-red-500" : "text-slate-900 dark:text-white"}`}>
              {fmtClock(remaining)}
            </span>
          </div>
        )}
        <div className="grid grid-cols-5 gap-1.5">
          {questions.map((q, i) => {
            let cls = "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] text-slate-700 dark:text-slate-300";
            if (mode === "review") {
              cls = isCorrect(q, reviewAnswers[q.id])
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400";
            } else if (isAnswered(q)) {
              cls = "border-blue-400/60 bg-blue-500/10 text-blue-600 dark:text-blue-400";
            }
            const current = mode === "attempt" && phase === "attempt" && i === idx;
            return (
              <button
                key={q.id}
                onClick={() =>
                  mode === "review"
                    ? document.getElementById(`rq-${q.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" })
                    : goTo(i)
                }
                className={`relative aspect-square rounded-lg border-[1.5px] text-[13px] font-black transition-all ${cls} ${
                  current ? "ring-2 ring-blue-500 ring-offset-1 ring-offset-white dark:ring-offset-[#0c1322]" : ""
                }`}
                aria-label={`Soal ${i + 1}`}
              >
                {i + 1}
                {flags[q.id] && (
                  <span className="absolute top-0 right-0 w-0 h-0 border-t-[10px] border-l-[10px] border-t-amber-500 border-l-transparent rounded-tr-md" />
                )}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-3 mt-3 text-[11px] text-slate-500">
          {mode === "review" ? (
            <>
              <span className="flex items-center gap-1"><i className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-500" />Benar</span>
              <span className="flex items-center gap-1"><i className="inline-block w-2.5 h-2.5 rounded-sm bg-red-500" />Salah</span>
            </>
          ) : (
            <>
              <span className="flex items-center gap-1"><i className="inline-block w-2.5 h-2.5 rounded-sm bg-blue-500" />Dijawab</span>
              <span className="flex items-center gap-1"><i className="inline-block w-2.5 h-2.5 rounded-sm border border-slate-400" />Belum</span>
              <span className="flex items-center gap-1"><i className="inline-block w-2.5 h-2.5 rounded-sm bg-amber-500" />Ditandai</span>
            </>
          )}
        </div>
        {mode === "attempt" && phase === "attempt" && (
          <button onClick={() => setPhase("summary")} className={`${linkBtn} block w-full text-center mt-4`}>
            Selesai mengerjakan…
          </button>
        )}
      </div>
    );
  };

  // ───────────────────────── Kotak info soal (kiri) ─────────────────────────
  const qInfo = (q: Question, i: number, review?: Record<string, number[]>) => {
    const ok = review ? isCorrect(q, review[q.id]) : false;
    const empty = review ? (review[q.id]?.length ?? 0) === 0 : !isAnswered(q);
    return (
      <div className="md:w-32 shrink-0 self-start p-3 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.03] text-xs text-slate-500 flex md:block flex-wrap gap-x-4 gap-y-1 items-center">
        <p className="text-slate-700 dark:text-slate-300">
          Soal <span className="text-xl font-black text-slate-900 dark:text-white">{i + 1}</span>
        </p>
        {review ? (
          <p className={`md:mt-1 font-bold ${ok ? "text-emerald-500" : "text-red-500"}`}>
            {empty ? "Tidak dijawab" : ok ? "Benar" : "Salah"}
          </p>
        ) : (
          <p className="md:mt-1">{empty ? "Belum dijawab" : "Sudah dijawab"}</p>
        )}
        <p className="md:mt-1">{review ? `Nilai ${ok ? "1,00" : "0,00"} dari 1,00` : "Nilai maksimal 1,00"}</p>
        {!review ? (
          <button
            onClick={() => setFlags({ ...flags, [q.id]: !flags[q.id] })}
            className={`md:mt-2 flex items-center gap-1 ${flags[q.id] ? "text-amber-500 font-bold" : "hover:text-amber-500"}`}
          >
            <Flag size={12} /> {flags[q.id] ? "Ditandai" : "Tandai soal"}
          </button>
        ) : (
          flags[q.id] && <p className="md:mt-1 text-amber-500 flex items-center gap-1"><Flag size={12} /> Ditandai</p>
        )}
      </div>
    );
  };

  // ───────────────────────── Pilihan jawaban ─────────────────────────
  const options = (q: Question, review?: number[]) => {
    const multi = q.type === "multi_select";
    const sel = review ?? answers[q.id] ?? [];
    const correctSet = new Set(Array.isArray(q.correct) ? q.correct : [q.correct]);
    return (
      <div className="space-y-1.5">
        {multi && !review && <p className="text-xs text-slate-500 mb-2">Pilih semua jawaban yang benar.</p>}
        {q.options.map((opt, k) => {
          const picked = sel.includes(k);
          let tone = "border-transparent hover:bg-blue-500/[0.06]";
          if (picked && !review) tone = "border-blue-400/50 bg-blue-500/10";
          if (picked && review) tone = correctSet.has(k) ? "border-emerald-500/50 bg-emerald-500/10" : "border-red-500/50 bg-red-500/10";
          return (
            <button
              key={k}
              disabled={!!review}
              onClick={() => choose(q, k)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left text-[15px] text-slate-700 dark:text-slate-200 transition-all disabled:cursor-default ${tone}`}
            >
              <span
                className={`w-[18px] h-[18px] shrink-0 border-2 grid place-items-center ${multi ? "rounded-[5px]" : "rounded-full"} ${
                  picked ? "border-blue-500" : "border-slate-400"
                }`}
              >
                {picked && <span className={`w-2 h-2 bg-blue-500 ${multi ? "rounded-[2px]" : "rounded-full"}`} />}
              </span>
              <span>
                <span className="font-bold text-slate-400 mr-1">{LETTERS[k]}.</span> {opt}
              </span>
              {review && picked && (
                <span className={`ml-auto font-black ${correctSet.has(k) ? "text-emerald-500" : "text-red-500"}`}>
                  {correctSet.has(k) ? "✓" : "✗"}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  // ═════════════════════════ 1. HALAMAN AWAL ═════════════════════════
  if (phase === "intro") {
    return (
      <div className="max-w-3xl mx-auto">
        {onPrev && (
          <button onClick={onPrev} className="mb-6 flex items-center gap-2 text-[12px] font-black uppercase tracking-wider text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <ArrowLeft size={14} /> Sebelumnya
          </button>
        )}
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-5">Quiz: {title}</h2>
        <div className={`${card} overflow-hidden`}>
          <table className="w-full text-sm">
            <tbody>
              {[
                ["Jumlah soal", `${questions.length} soal`],
                ["Batas waktu", `${timeLimitMin} menit`],
                ["Nilai lulus", `${Math.round(PASS_THRESHOLD * 100)} dari 100`],
                ["Percobaan", "Tidak dibatasi · nilai tertinggi yang disimpan"],
                ...(best ? [["Nilai tertinggi", `${best.percent} / 100${best.passed ? " · LULUS" : ""}`]] : []),
              ].map(([k, v]) => (
                <tr key={k} className="border-b last:border-0 border-slate-200 dark:border-white/[0.06]">
                  <th className="w-44 text-right px-4 py-2.5 font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-white/[0.03]">{k}</th>
                  <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-6 text-center">
            <p className="text-sm text-slate-500 mb-4">
              Jawaban baru dinilai setelah kamu menekan <b>Kirim semua dan selesai</b>. Selama waktu masih ada,
              kamu bisa berpindah soal dan mengubah jawaban.
              <br />
              <b>Mode ujian:</b> setelah dimulai, menu lain dan Tanya AI tidak bisa dibuka sampai jawaban dikirim.
            </p>
            <button onClick={start} className={btnPrimary}>{last ? "Mulai percobaan baru" : "Mulai quiz"}</button>
            {attempts.length > 0 && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`${linkBtn} mx-auto mt-4 flex items-center gap-1.5`}
              >
                {showHistory ? "Sembunyikan hasil" : `Lihat hasil sebelumnya (${attempts.length})`}
                <ChevronDown size={15} className={`transition-transform ${showHistory ? "rotate-180" : ""}`} />
              </button>
            )}
          </div>
        </div>

        {showHistory && attempts.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3">Riwayat percobaan</h3>
            <div className={`${card} overflow-x-auto`}>
              <table className="w-full text-sm min-w-[560px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-white/[0.03] text-left text-slate-900 dark:text-white">
                    <th className="px-4 py-2.5 w-16">Ke-</th>
                    <th className="px-4 py-2.5">Selesai pada</th>
                    <th className="px-4 py-2.5">Waktu</th>
                    <th className="px-4 py-2.5">Benar</th>
                    <th className="px-4 py-2.5">Nilai</th>
                    <th className="px-4 py-2.5 text-right">Pembahasan</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((a, i) => ({ a, i })).reverse().map(({ a, i }) => {
                    const isBest = a === best;
                    return (
                      <tr key={a.at} className={`border-t border-slate-200 dark:border-white/[0.06] ${isBest ? "bg-emerald-500/[0.06]" : ""}`}>
                        <td className="px-4 py-2.5 font-bold text-slate-900 dark:text-white">{i + 1}</td>
                        <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">{fmtDate(a.at)}</td>
                        <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">{a.startedAt ? fmtDuration(a.at - a.startedAt) : "-"}</td>
                        <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">{a.score}/{a.total}</td>
                        <td className="px-4 py-2.5">
                          <span className="font-black text-slate-900 dark:text-white">{a.percent}</span>
                          <span className={`ml-2 text-[10px] font-black px-2 py-0.5 rounded-full ${a.passed ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-red-500/10 text-red-600 dark:text-red-400"}`}>
                            {a.passed ? "LULUS" : "BELUM"}
                          </span>
                          {isBest && <span className="ml-2 text-[10px] font-black text-emerald-600 dark:text-emerald-400">★ TERTINGGI</span>}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <button onClick={() => openPastReview(a)} className={linkBtn}>Lihat</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Pembahasan percobaan lama memakai daftar soal saat ini. Soal yang ditambahkan setelah percobaan itu tampil sebagai &quot;Tidak dijawab&quot;.
            </p>
          </div>
        )}
      </div>
    );
  }

  // ── Bingkai mode ujian: layar penuh, di atas navbar, sidebar, dan Tanya AI ──
  const focusShell = (body: React.ReactNode) => (
    <div ref={focusRef} className="fixed inset-0 z-[10000] overflow-y-auto bg-slate-50 dark:bg-[#020617]">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-4 md:px-8 py-3 border-b border-slate-200 dark:border-white/[0.08] bg-white/90 dark:bg-[#020617]/95 backdrop-blur-xl">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">🔒 Mode ujian</p>
          <p className="text-sm font-black text-slate-900 dark:text-white truncate">Quiz: {title}</p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <span className="hidden sm:block text-xs text-slate-500">{answeredCount}/{questions.length} terjawab</span>
          <button
            onClick={toggleTheme}
            aria-label={isDark ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
            title={isDark ? "Mode terang" : "Mode gelap"}
            className="w-9 h-9 grid place-items-center rounded-lg border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-blue-500 transition-all"
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <span className={`flex items-center gap-1.5 text-sm font-black tabular-nums ${remaining < 60_000 ? "text-red-500" : "text-slate-900 dark:text-white"}`}>
            <Clock size={14} /> {fmtClock(remaining)}
          </span>
        </div>
      </div>
      <div className="px-4 md:px-8 py-8">{body}</div>

      {leaveWarn && (
        <div className="fixed inset-0 z-[300] grid place-items-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className={`${card} max-w-md w-full p-6`}>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">Ujian sedang berlangsung</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Kamu belum bisa meninggalkan halaman ini. Selesaikan soal lalu tekan <b>Kirim semua dan selesai</b>.
            </p>
            <div className="flex justify-end mt-6">
              <button onClick={() => setLeaveWarn(false)} className={btnPrimary}>Lanjutkan ujian</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ═════════════════════════ 2. MENGERJAKAN ═════════════════════════
  if (phase === "attempt") {
    const q = questions[idx];
    const isLast = idx === questions.length - 1;
    return focusShell(
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6 items-start">
          <div className={card}>
            <div className="p-4 md:p-5 flex flex-col md:flex-row gap-4">
              {qInfo(q, idx)}
              <div className="flex-1 p-5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-sky-50/60 dark:bg-white/[0.03]">
                <p className="text-base font-semibold text-slate-900 dark:text-white mb-4 leading-relaxed">{q.prompt}</p>
                {q.message && <MessageView m={q.message} />}
                {options(q)}
                {isAnswered(q) && (
                  <button onClick={() => setAnswers({ ...answers, [q.id]: [] })} className={`${linkBtn} mt-2 px-3 font-medium`}>
                    Hapus pilihan
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between px-5 pb-5">
              <button disabled={idx === 0} onClick={() => goTo(idx - 1)} className={linkBtn}>◀ Halaman sebelumnya</button>
              {isLast ? (
                <button onClick={() => setPhase("summary")} className={btnPrimary}>Selesai mengerjakan…</button>
              ) : (
                <button onClick={() => goTo(idx + 1)} className={linkBtn}>Halaman berikutnya ▶</button>
              )}
            </div>
          </div>
          {navPanel("attempt")}
        </div>
      </div>
    );
  }

  // ═════════════════════════ 3. RINGKASAN ═════════════════════════
  if (phase === "summary") {
    const empty = questions.length - answeredCount;
    return focusShell(
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-5">Ringkasan percobaan</h2>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6 items-start">
          <div className={`${card} overflow-hidden`}>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-white/[0.03] text-left text-slate-900 dark:text-white">
                  <th className="px-4 py-2.5 w-20">Soal</th><th className="px-4 py-2.5">Status</th><th className="px-4 py-2.5 w-24">Tanda</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q, i) => (
                  <tr key={q.id} onClick={() => goTo(i)} className="cursor-pointer border-t border-slate-200 dark:border-white/[0.06] hover:bg-blue-500/[0.06]">
                    <td className="px-4 py-2.5 font-bold">{i + 1}</td>
                    <td className="px-4 py-2.5">
                      {isAnswered(q) ? (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">Sudah dijawab</span>
                      ) : (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">Belum dijawab</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">{flags[q.id] ? <Flag size={14} className="text-amber-500" /> : null}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-6 text-center space-y-4">
              <button onClick={() => setPhase("attempt")} className={btnOutline}>Kembali ke percobaan</button>
              <p className="text-xs text-slate-500">Setelah dikirim, jawaban tidak bisa diubah lagi.</p>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button onClick={() => setConfirmOpen(true)} className={btnPrimary}>Kirim semua dan selesai</button>
            </div>
          </div>
          {navPanel("attempt")}
        </div>

        {confirmOpen && (
          <div className="fixed inset-0 z-[200] grid place-items-center bg-slate-950/60 backdrop-blur-sm p-4">
            <div className={`${card} max-w-md w-full p-6`}>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">Kirim semua jawaban?</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {empty
                  ? <>Masih ada <b>{empty} soal belum dijawab</b>. Soal kosong dihitung salah.</>
                  : "Semua soal sudah dijawab. Jawaban tidak bisa diubah setelah dikirim."}
              </p>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setConfirmOpen(false)} className={btnOutline}>Batal</button>
                <button onClick={submit} className={btnPrimary}>Kirim dan selesai</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ═════════════════════════ 4. HASIL + PEMBAHASAN ═════════════════════════
  if (!outcome) return null;
  const att = outcome.attempt;
  const finishedAt = att.at;
  const begun = att.startedAt; // percobaan lama (sebelum fitur ini) tidak punya waktu mulai
  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-5">Quiz: {title} · Hasil</h2>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6 items-start">
        <div className="space-y-5">
          <div className={`${card} overflow-hidden`}>
            <table className="w-full text-sm">
              <tbody>
                {[
                  ["Dimulai pada", fmtDate(begun)],
                  ["Status", "Selesai"],
                  ["Selesai pada", fmtDate(finishedAt)],
                  ["Waktu pengerjaan", begun ? fmtDuration(finishedAt - begun) : "-"],
                  ["Benar", `${att.score} dari ${att.total} soal`],
                ].map(([k, v]) => (
                  <tr key={k} className="border-b border-slate-200 dark:border-white/[0.06]">
                    <th className="w-44 text-right px-4 py-2.5 font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-white/[0.03]">{k}</th>
                    <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">{v}</td>
                  </tr>
                ))}
                <tr>
                  <th className="w-44 text-right px-4 py-2.5 font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-white/[0.03]">Nilai</th>
                  <td className="px-4 py-2.5">
                    <span className="text-lg font-black text-slate-900 dark:text-white">{att.percent}</span>
                    <span className="text-slate-500"> dari 100 </span>
                    <span className={`ml-2 text-xs font-black px-2.5 py-1 rounded-full ${att.passed ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-red-500/10 text-red-600 dark:text-red-400"}`}>
                      {att.passed ? "LULUS" : "BELUM LULUS"}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4">
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
                <h3 className="text-sm font-black text-slate-900 dark:text-white mb-2">✅ Sudah dikuasai</h3>
                <ul className="list-disc pl-5 text-sm space-y-1 text-slate-700 dark:text-slate-300">
                  {outcome.understood.length ? outcome.understood.map((c) => <li key={c}>{c}</li>) : <li>-</li>}
                </ul>
              </div>
              <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10">
                <h3 className="text-sm font-black text-slate-900 dark:text-white mb-2">🔁 Perlu dipelajari lagi</h3>
                {outcome.toReview.length ? (
                  <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                    {outcome.toReview.map((r) => (
                      <li key={r.concept}><b>{r.concept}</b>{r.note && <span className="block text-xs text-slate-500 mt-0.5">{r.note}</span>}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-700 dark:text-slate-300">Tidak ada. Mantap!</p>
                )}
              </div>
            </div>
            {outcome.moduleCompleted && (
              <p className="mx-4 mb-4 p-3 rounded-xl border border-blue-400/30 bg-blue-500/10 text-sm font-bold text-blue-700 dark:text-blue-300 text-center">
                Semua materi, latihan, dan quiz selesai. Progres modul 100%.
              </p>
            )}
          </div>

          {questions.map((q, i) => {
            const sel = att.answers[q.id] ?? [];
            const correctIdx = Array.isArray(q.correct) ? q.correct : [q.correct];
            const expl = Array.isArray(q.explanation) ? q.explanation : [q.explanation];
            return (
              <div key={q.id} id={`rq-${q.id}`} className={`${card} scroll-mt-28`}>
                <div className="p-4 md:p-5 flex flex-col md:flex-row gap-4">
                  {qInfo(q, i, att.answers)}
                  <div className="flex-1 p-5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-sky-50/60 dark:bg-white/[0.03]">
                    <p className="text-base font-semibold text-slate-900 dark:text-white mb-4 leading-relaxed">{q.prompt}</p>
                    {q.message && <MessageView m={q.message} />}
                    {options(q, sel)}
                    <div className="mt-4 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-sm text-slate-700 dark:text-slate-300">
                      <p>
                        <b className="text-slate-900 dark:text-white">Jawaban yang benar adalah: </b>
                        {correctIdx.map((k) => `${LETTERS[k]}. ${q.options[k]}`).join("; ")}
                      </p>
                      {expl.map((e, j) => <p key={j} className="mt-1.5">{e}</p>)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="flex flex-wrap gap-3 justify-center pt-2">
            <button onClick={() => setPhase("intro")} className={btnOutline}>Kembali ke halaman quiz</button>
            <button onClick={start} className={btnPrimary}>Coba lagi</button>
            <Link href="/pembelajaran" className={btnOutline}>Ke daftar materi</Link>
          </div>
        </div>
        {navPanel("review")}
      </div>
    </div>
  );
}