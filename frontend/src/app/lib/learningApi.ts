// ─────────────────────────────────────────────────────────────────
// src/app/lib/learningApi.ts
// PROTOTYPE: progress dan hasil quiz disimpan di localStorage, dipisah per akun
// (key berdasarkan email, sama seperti chatSync.ts).
// Tiap fungsi di sini padanannya endpoint /learning/* di backend,
// jadi saat dihubungkan ke backend cukup isi fungsinya yang diganti
// (lihat useLearning.ts sebagai satu-satunya pemakai).
// ─────────────────────────────────────────────────────────────────

import { getUserEmail } from "./user";
import { availableStages, type Question } from "./quizzes";

export const PASS_THRESHOLD = 0.7;
export const SYNC_EVENT = "cyberguard_learning_sync";

export interface Attempt {
  score: number;
  total: number;
  percent: number;
  passed: boolean;
  at: number;
  answers: Record<string, number[]>;
}

export interface ModuleRecord {
  steps: string[];       // langkah yang sudah dilewati
  completedAt?: number;  // diisi sekali, status Selesai tidak turun walau topik ditambah
  attempts: Attempt[];
}

export type LearningStore = Record<string, ModuleRecord>;

const storageKey = () => `cyberguard_learning_${getUserEmail()}`;

export function readStore(): LearningStore {
  try {
    const raw = localStorage.getItem(storageKey());
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeStore(s: LearningStore): void {
  localStorage.setItem(storageKey(), JSON.stringify(s));
  window.dispatchEvent(new Event(SYNC_EVENT));
}

// ── Langkah modul ────────────────────────────────────────────────

/** topic-<id> ... lalu tahap yang soalnya tersedia (latihan, simulasi, quiz) */
export function getSteps(slug: string, topicIds: number[]): string[] {
  return [...topicIds.map((i) => `topic-${i}`), ...availableStages(slug)];
}

export type ModuleStatus = "belum_dimulai" | "sedang_dipelajari" | "selesai";

export interface ModuleState {
  done: string[];
  percent: number;
  status: ModuleStatus;
  nextStep: string | null;
  completed: boolean;
  hasNewContent: boolean;
  best: Attempt | null;
  last: Attempt | null;
  passed: boolean;
}

export function getModuleState(
  record: ModuleRecord | undefined,
  steps: string[]
): ModuleState {
  const done = (record?.steps ?? []).filter((s) => steps.includes(s));
  const completed = !!record?.completedAt;
  const percent = completed
    ? 100
    : steps.length
    ? Math.round((done.length / steps.length) * 100)
    : 0;
  const nextStep = steps.find((s) => !done.includes(s)) ?? null;
  const attempts = record?.attempts ?? [];
  const best = attempts.length
    ? attempts.reduce((a, b) => (b.percent >= a.percent ? b : a))
    : null;
  return {
    done,
    percent,
    status: percent === 100 ? "selesai" : percent === 0 ? "belum_dimulai" : "sedang_dipelajari",
    nextStep: completed ? null : nextStep,
    completed,
    hasNewContent: completed && nextStep !== null,
    best,
    last: attempts.length ? attempts[attempts.length - 1] : null,
    passed: attempts.some((a) => a.passed),
  };
}

/** Langkah terbuka jika semua langkah sebelumnya selesai (modul Selesai terbuka bebas) */
export function isUnlocked(
  step: string,
  steps: string[],
  record: ModuleRecord | undefined
): boolean {
  const idx = steps.indexOf(step);
  if (idx < 0) return false;
  if (record?.completedAt) return true;
  const done = new Set(record?.steps ?? []);
  return steps.slice(0, idx).every((s) => done.has(s));
}

function finalize(rec: ModuleRecord, steps: string[]): boolean {
  if (rec.completedAt) return true;
  if (steps.every((s) => rec.steps.includes(s))) {
    rec.completedAt = Date.now();
    return true;
  }
  return false;
}

// padanan: POST /learning/step/complete
export function completeStep(
  slug: string,
  step: string,
  steps: string[]
): { ok: boolean; moduleCompleted: boolean; error?: string } {
  const store = readStore();
  const rec: ModuleRecord = store[slug] ?? { steps: [], attempts: [] };
  if (step === "quiz") {
    return { ok: false, moduleCompleted: false, error: "Langkah quiz selesai lewat pengiriman quiz." };
  }
  if (!isUnlocked(step, steps, rec)) {
    return { ok: false, moduleCompleted: false, error: "Selesaikan langkah sebelumnya terlebih dahulu." };
  }
  if (!rec.steps.includes(step)) rec.steps.push(step); // idempotent
  const moduleCompleted = finalize(rec, steps);
  store[slug] = rec;
  writeStore(store);
  return { ok: true, moduleCompleted };
}

// ── Penilaian quiz ───────────────────────────────────────────────

export function isCorrect(q: Question, selected: number[] | undefined): boolean {
  if (!selected || selected.length === 0) return false;
  if (q.type === "multi_select") {
    const c = new Set(q.correct as number[]);
    return c.size === selected.length && selected.every((i) => c.has(i));
  }
  return selected.length === 1 && selected[0] === q.correct;
}

export interface ConceptSummary {
  understood: string[];
  toReview: { concept: string; note: string }[];
}

export function summarizeConcepts(
  questions: Question[],
  answers: Record<string, number[]>
): ConceptSummary {
  const toReview: { concept: string; note: string }[] = [];
  const understood: string[] = [];
  for (const q of questions) {
    if (!q.concept) continue;
    if (isCorrect(q, answers[q.id])) {
      if (!understood.includes(q.concept)) understood.push(q.concept);
    } else if (!toReview.some((r) => r.concept === q.concept)) {
      toReview.push({ concept: q.concept, note: q.conceptNote ?? "" });
    }
  }
  return {
    understood: understood.filter((c) => !toReview.some((r) => r.concept === c)),
    toReview,
  };
}

export interface SubmitOutcome extends ConceptSummary {
  attempt: Attempt;
  moduleCompleted: boolean;
}

// padanan: POST /learning/quiz/submit
export function submitQuiz(
  slug: string,
  steps: string[],
  questions: Question[],
  answers: Record<string, number[]>
): SubmitOutcome | { error: string } {
  const store = readStore();
  const rec: ModuleRecord = store[slug] ?? { steps: [], attempts: [] };
  if (!isUnlocked("quiz", steps, rec)) {
    return { error: "Selesaikan langkah sebelumnya terlebih dahulu." };
  }
  const score = questions.filter((q) => isCorrect(q, answers[q.id])).length;
  const total = questions.length;
  const attempt: Attempt = {
    score,
    total,
    percent: total ? Math.round((score / total) * 100) : 0,
    passed: total > 0 && score / total >= PASS_THRESHOLD,
    at: Date.now(),
    answers,
  };
  rec.attempts.push(attempt);
  if (!rec.steps.includes("quiz")) rec.steps.push("quiz"); // selesai berapa pun skornya
  const moduleCompleted = finalize(rec, steps);
  store[slug] = rec;
  writeStore(store);
  return { attempt, moduleCompleted, ...summarizeConcepts(questions, answers) };
}

/** Khusus demo: hapus progress satu materi */
export function resetModule(slug: string): void {
  const store = readStore();
  delete store[slug];
  writeStore(store);
}
