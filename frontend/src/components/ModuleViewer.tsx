"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as Icons from "lucide-react";
import {
  AlertTriangle, ArrowRight, BookOpen, CheckCircle, ChevronRight, ExternalLink,
  Lock as LockIcon, RotateCcw,
} from "lucide-react";
import { getModuleState, getSteps, isUnlocked } from "../app/lib/learningApi";
import { useLearning } from "../app/lib/useLearning";
import { getQuiz, type StageKey } from "../app/lib/quizzes";
import { PracticeStage } from "./learning/Stages";
import { ExamQuiz } from "./learning/ExamQuiz";

// ── Ikon: dicari dari nama di JSON, jadi tidak perlu daftar ikon manual ──
type IconCmp = React.ComponentType<{ size?: number; className?: string }>;
const iconLib = Icons as unknown as Record<string, IconCmp>;
function NamedIcon({ name, size = 15 }: { name?: string; size?: number }) {
  const C = (name && iconLib[name]) || Icons.FileText;
  return <C size={size} />;
}

const STAGE_META: Record<StageKey, { label: string; icon: string }> = {
  latihan: { label: "Latihan Interaktif", icon: "MousePointerClick" },
  simulasi: { label: "Simulasi Kasus", icon: "Target" },
  quiz: { label: "Quiz", icon: "ClipboardCheck" },
};

// ── Bagian isi topik (sama seperti templat sebelumnya) ──
function CaseBox({ c }: { c: any }) {
  const nyata = c.type !== "ilustrasi"; // tanpa "type" dianggap kasus nyata (materi lama)
  return (
    <div className={`p-6 rounded-2xl border ${
      nyata
        ? "border-amber-200 dark:border-amber-500/15 bg-amber-50 dark:bg-amber-500/[0.04]"
        : "border-sky-200 dark:border-sky-500/15 bg-sky-50 dark:bg-sky-500/[0.04]"
    }`}>
      <div className="flex items-center gap-2 mb-3">
        {nyata ? (
          <AlertTriangle size={13} className="text-amber-500 shrink-0" />
        ) : (
          <BookOpen size={13} className="text-sky-500 shrink-0" />
        )}
        <p className={`text-[10px] font-black uppercase tracking-widest ${nyata ? "text-amber-500" : "text-sky-500"}`}>
          {nyata ? "Kasus Nyata" : "Contoh Skenario"}
        </p>
      </div>
      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">{c.title}</p>
      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">{c.story}</p>
      <div className="flex items-start gap-2 p-3 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.07]">
        <CheckCircle size={12} className="text-emerald-500 mt-0.5 shrink-0" />
        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{c.lesson}</p>
      </div>
      {!nyata && (
        <p className="mt-3 text-[11px] text-slate-500 italic">Skenario ilustrasi untuk belajar, bukan kejadian nyata.</p>
      )}
      {c.sources?.length > 0 && (
        <div className="mt-4 pt-3 border-t border-amber-200/70 dark:border-white/[0.06]">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Sumber kasus</p>
          <ul className="space-y-1.5">
            {c.sources.map((s: any, i: number) => (
              <li key={i}>
                <a href={s.url} target="_blank" rel="noopener noreferrer"
                   className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline">
                  {s.label} <ExternalLink size={11} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ReferencesSection({ references }: { references: any[] }) {
  if (!references || references.length === 0) return null;
  const parse = (ref: any) => {
    if (typeof ref === "string") {
      const parts = ref.split(" - ");
      if (parts.length >= 2)
        return { url: parts[0].trim(), label: parts.slice(1).join(" - ").trim(), type: "", year: "" };
      return { url: ref, label: "Baca sumber", type: "", year: "" };
    }
    return {
      url: ref.direct_url || ref.fallback_url || "",
      label: ref.label || "Baca sumber",
      type: ref.type || "",
      year: ref.year || "",
    };
  };
  return (
    <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Sumber Referensi</h3>
        <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold">
          {references.length}
        </span>
      </div>
      <ol className="list-decimal list-inside space-y-3 ml-2">
        {references.map((ref, idx) => {
          const { url, label, type, year } = parse(ref);
          return (
            <li key={idx} className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1.5"
              >
                {label}
                <ExternalLink size={12} className="inline" />
              </a>
              {type && year && (
                <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                  ({type}, {year})
                </span>
              )}
            </li>
          );
        })}
      </ol>
      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700/50">
        <p className="text-xs text-slate-500 dark:text-slate-400 italic">
          * Klik pada setiap referensi untuk mengakses sumber asli
        </p>
      </div>
    </div>
  );
}

function TopicContent({ t, title }: { t: any; title: string }) {
  return (
    <div className="px-8 lg:px-12 xl:px-16 py-12 w-full max-w-none">
      <div className="mb-10">
        <p className="text-blue-500 text-[11px] font-black tracking-[6px] uppercase mb-3">{title}</p>
        <h1 className="text-5xl xl:text-6xl font-[1000] text-slate-900 dark:text-white leading-tight tracking-tighter">
          {t?.subtitle}
        </h1>
        <div className="mt-4 h-px bg-gradient-to-r from-blue-600/40 via-blue-500/20 to-transparent" />
      </div>

      <div className="space-y-12">
        {t?.quote && (
          <blockquote className="border-l-4 border-blue-600 dark:border-blue-500 pl-8 bg-blue-50/50 dark:bg-transparent py-4 rounded-r-xl">
            <p className="text-xl italic text-slate-700 dark:text-slate-200 leading-relaxed font-medium">"{t.quote}"</p>
          </blockquote>
        )}

        {t?.definition && (
          <div className="space-y-6">
            {t.definition.split("\n\n").map((p: string, i: number) => (
              <p key={i} className="text-lg leading-9 text-slate-700 dark:text-slate-300" style={{ textAlign: "justify", textJustify: "inter-word" }}>
                {p}
              </p>
            ))}
          </div>
        )}

        {t?.sections?.map((section: any, i: number) => (
          <div key={i} className="space-y-6">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white pt-10 border-t border-slate-100 dark:border-white/5">
              {section.title}
            </h2>
            {section.content.map((p: string, j: number) => (
              <p key={j} className="text-lg leading-9 text-slate-700 dark:text-slate-300" style={{ textAlign: "justify", textJustify: "inter-word" }}>
                {p}
              </p>
            ))}
          </div>
        ))}

        {t?.case_study && <CaseBox c={t.case_study} />}
        {t?.references && <ReferencesSection references={t.references} />}
      </div>
    </div>
  );
}

// ───────────────────────────── Halaman modul ─────────────────────────────

export default function ModuleViewer({ slug, data }: { slug: string; data: any }) {
  const router = useRouter();
  const { store, ready, completeStep, submitQuiz, resetModule } = useLearning();

  const title: string = data.title ?? slug;
  const nav: any[] = data.navigation ?? [];
  const tiers = (data.tiers_content ?? {}) as Record<string, any>;
  const quiz = getQuiz(slug);

  const topicIds = useMemo(() => nav.map((n) => n.id as number), [nav]);
  const steps = useMemo(() => getSteps(slug, topicIds), [slug, topicIds]);
  const hasQuiz = steps.includes("quiz");

  const record = store[slug];
  const state = getModuleState(record, steps);

  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Langkah awal: ?step=... bila terbuka, jika tidak langkah pertama yang belum selesai
  useEffect(() => {
    if (!ready || activeStep) return;
    const wanted = new URLSearchParams(window.location.search).get("step");
    if (wanted && isUnlocked(wanted, steps, record)) return setActiveStep(wanted);
    setActiveStep(state.nextStep ?? steps[0]);
  }, [ready, activeStep, steps, record, state.nextStep]);

  // Pengaman: jika langkah aktif terkunci (mis. setelah reset), kembali ke langkah terbuka
  useEffect(() => {
    if (ready && activeStep && !isUnlocked(activeStep, steps, record)) {
      setActiveStep(state.nextStep ?? steps[0]);
    }
  }, [ready, activeStep, steps, record, state.nextStep]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setError("");
  }, [activeStep]);

  if (!ready || !activeStep) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#020617] text-slate-500 text-sm">
        Memuat modul...
      </div>
    );
  }

  const idx = steps.indexOf(activeStep);
  const prevStep = idx > 0 ? steps[idx - 1] : null;
  const nextStep = idx < steps.length - 1 ? steps[idx + 1] : null;
  const isTopic = activeStep.startsWith("topic-");

  const goTo = (step: string) => {
    if (isUnlocked(step, steps, record)) setActiveStep(step);
  };

  const advance = (fromStep: string) => {
    const res = completeStep(slug, fromStep, steps);
    if (!res.ok) return setError(res.error ?? "Gagal menyimpan progress.");
    if (nextStep) setActiveStep(nextStep);
    else router.push("/pembelajaran");
  };

  const labelFor = (step: string | null) => {
    if (!step) return "Selesai";
    if (step === "latihan") return "Lanjut ke Latihan";
    if (step === "simulasi") return "Lanjut ke Simulasi";
    if (step === "quiz") return "Mulai Quiz";
    return "Topik Berikutnya";
  };

  const topicNum = (step: string) => Number(step.replace("topic-", ""));
  const activeTier = isTopic ? tiers[String(topicNum(activeStep))] : null;
  const stageKey = (isTopic ? null : activeStep) as StageKey | null;

  const topBarPill = isTopic
    ? `Topik ${String(topicNum(activeStep)).padStart(2, "0")}`
    : STAGE_META[stageKey!].label;
  const topBarTitle = isTopic ? activeTier?.subtitle : title;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-600 dark:text-slate-300 font-sans transition-colors duration-500">
      <div className="flex">
        {/* ── SIDEBAR ── */}
        <aside className="fixed left-0 top-20 w-72 h-[calc(100vh-5rem)] border-r border-slate-200 dark:border-slate-800/60 px-6 py-8 hidden lg:flex flex-col bg-white dark:bg-[#020617] z-10 overflow-y-auto transition-all">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 mb-6 uppercase tracking-widest">
            <Link href="/pembelajaran" className="hover:text-slate-400 transition-colors">Pembelajaran</Link>
            <ChevronRight size={10} />
            <span className="text-blue-500">{title}</span>
          </div>

          <nav className="space-y-1.5 flex-1">
            {steps.map((step) => {
              const topic = step.startsWith("topic-");
              const navItem = topic ? nav.find((n) => n.id === topicNum(step)) : null;
              const meta = topic ? null : STAGE_META[step as StageKey];
              const unlocked = isUnlocked(step, steps, record);
              const done = state.done.includes(step) || state.completed;
              const active = step === activeStep;
              const firstStage = !topic && (step === "latihan" || (step === "simulasi" && !steps.includes("latihan")) || (step === "quiz" && !steps.includes("latihan") && !steps.includes("simulasi")));

              return (
                <React.Fragment key={step}>
                  {firstStage && (
                    <p className="pt-4 pb-1 px-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      Latihan &amp; Quiz
                    </p>
                  )}
                  <button
                    disabled={!unlocked}
                    onClick={() => goTo(step)}
                    className={`w-full flex items-start gap-3 px-4 py-3.5 rounded-xl border transition-all text-left ${
                      active
                        ? "bg-blue-50 dark:bg-blue-600/10 border-blue-200 dark:border-blue-500/25 text-blue-600 dark:text-blue-300 shadow-sm"
                        : unlocked
                        ? "border-transparent text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.03]"
                        : "border-transparent text-slate-300 dark:text-slate-700 cursor-not-allowed"
                    }`}
                  >
                    <div className={`mt-0.5 shrink-0 ${active ? "text-blue-400" : "text-slate-400"}`}>
                      {!unlocked ? (
                        <LockIcon size={15} />
                      ) : done && !active ? (
                        <CheckCircle size={15} className="text-emerald-500" />
                      ) : (
                        <NamedIcon name={topic ? navItem?.icon : meta?.icon} />
                      )}
                    </div>
                    <div>
                      <p className={`text-[9px] font-black uppercase tracking-widest mb-0.5 ${active ? "text-blue-500" : "text-slate-400"}`}>
                        {topic ? `Topik ${String(topicNum(step)).padStart(2, "0")}` : "Tahap"}
                      </p>
                      <p className="text-[12px] font-bold leading-tight">{topic ? navItem?.label : meta?.label}</p>
                    </div>
                  </button>
                </React.Fragment>
              );
            })}

            {!hasQuiz && (
              <div className="mt-3 flex items-start gap-3 px-4 py-3.5 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600">
                <LockIcon size={15} className="mt-0.5 shrink-0" />
                <div>
                  <p className="text-[12px] font-bold leading-tight">Quiz</p>
                  <p className="text-[10px] mt-0.5">Segera hadir</p>
                </div>
              </div>
            )}
          </nav>

          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800/60">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Progress</p>
              <p className="text-[11px] font-bold text-slate-400">
                {state.completed ? steps.length : state.done.length}/{steps.length}
              </p>
            </div>
            <div className="h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${state.percent}%` }} />
            </div>
            <button
              onClick={() => {
                resetModule(slug);
                setActiveStep(steps[0]);
              }}
              className="mt-4 flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-red-400 transition-colors"
            >
              <RotateCcw size={10} /> Reset progress (demo)
            </button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="flex-1 lg:ml-72 min-h-screen bg-slate-50 dark:bg-[#020617]">
          <div className="sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800/60 bg-white/80 dark:bg-[#020617]/95 backdrop-blur-xl px-8 lg:px-16 py-4 flex items-center justify-between transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest px-2.5 py-1 rounded-md border border-blue-500/20 bg-blue-500/10">
                {topBarPill}
              </span>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{topBarTitle}</span>
            </div>
            <div className="text-[11px] text-slate-400 dark:text-slate-600 font-semibold hidden sm:block">
              {state.completed ? steps.length : state.done.length}/{steps.length} Langkah · {state.percent}%
            </div>
          </div>

          {error && (
            <div className="mx-8 lg:mx-16 mt-6 p-3 rounded-xl border border-red-300 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {isTopic && (
            <>
              <TopicContent t={activeTier} title={title} />
              <div className="px-8 lg:px-12 xl:px-16 pb-16">
                <div className="pt-8 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between">
                  <button
                    onClick={() => prevStep && goTo(prevStep)}
                    className={`flex items-center gap-3 text-[13px] font-black uppercase tracking-wider text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors ${prevStep ? "" : "invisible"}`}
                  >
                    <ArrowRight size={16} className="rotate-180" /> Topik Sebelumnya
                  </button>
                  <button
                    onClick={() => advance(activeStep)}
                    className={`flex items-center gap-3 px-8 py-3.5 rounded-xl text-[12px] font-black uppercase tracking-wider transition-all ${
                      nextStep
                        ? "bg-blue-600 hover:bg-blue-500 text-white"
                        : "bg-slate-900 dark:bg-white hover:bg-slate-700 dark:hover:bg-slate-100 text-white dark:text-[#020617]"
                    }`}
                  >
                    {labelFor(nextStep)} <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </>
          )}

          {stageKey && stageKey !== "quiz" && (
            <div className="px-6 lg:px-12 py-12">
              <PracticeStage
                key={stageKey}
                questions={quiz[stageKey] ?? []}
                doneLabel={labelFor(nextStep)}
                onDone={() => advance(stageKey)}
                onPrev={prevStep ? () => goTo(prevStep) : undefined}
              />
            </div>
          )}

          {stageKey === "quiz" && (
            <div className="px-6 lg:px-12 py-12">
              <ExamQuiz
                key="quiz"
                title={title}
                questions={quiz.quiz ?? []}
                attempts={record?.attempts ?? []}
                onSubmit={(answers, startedAt) => submitQuiz(slug, steps, quiz.quiz ?? [], answers, startedAt)}
                onPrev={prevStep ? () => goTo(prevStep) : undefined}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
