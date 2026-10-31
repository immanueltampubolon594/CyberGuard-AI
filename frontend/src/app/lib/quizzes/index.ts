import { phishingQuiz } from "./phishing";
import { passwordQuiz } from "./password";
import { STAGE_ORDER, type ModuleQuiz, type StageKey } from "./types";

export * from "./types";

// Daftarkan soal materi lain di sini. Materi yang belum terdaftar
// hanya punya langkah topik (tahap latihan/simulasi/quiz dilewati).
const quizzes: Record<string, ModuleQuiz> = {
  phishing: phishingQuiz,
  "password-attack": passwordQuiz,
};

export function getQuiz(slug: string): ModuleQuiz {
  return quizzes[slug] ?? {};
}

export function availableStages(slug: string): StageKey[] {
  const q = getQuiz(slug);
  return STAGE_ORDER.filter((s) => (q[s]?.length ?? 0) > 0);
}