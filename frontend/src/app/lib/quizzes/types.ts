// Tipe data soal. Jenis soal baru cukup ditambah di QuestionType
// lalu ditangani di QuestionCard (components/learning/Stages.tsx) dan isCorrect() pada learningApi.ts.

export type StageKey = "latihan" | "simulasi" | "quiz";
export const STAGE_ORDER: StageKey[] = ["latihan", "simulasi", "quiz"];

export type QuestionType = "multi_select" | "scenario" | "single";

export interface Message {
  sender: string;
  time?: string;
  lines: string[];
}

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  message?: Message;          // pesan/skenario yang ditampilkan di atas pilihan
  options: string[];
  correct: number | number[]; // multi_select: array indeks, lainnya: satu indeks
  explanation: string | string[];
  concept?: string;           // dipakai untuk "Yang Sudah Dipahami / Perlu Dipelajari Lagi"
  conceptNote?: string;
}

export interface ModuleQuiz {
  latihan?: Question[];
  simulasi?: Question[];
  quiz?: Question[];
}
