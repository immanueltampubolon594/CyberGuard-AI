import { phishingQuiz } from "./phishing";
import { passwordQuiz } from "./password";
import { socialEngineeringQuiz } from "./social-engineering";
import { scamOnlineQuiz } from "./scam-online";
import { malwareQuiz } from "./malware";
import { qrCodeAttackQuiz } from "./qr-code-attack";
import { ecommerceFraudQuiz } from "./ecommerce-fraud";
import { mobileBankingQuiz } from "./mobile-banking";
import { accountTakeoverQuiz } from "./account-takeover";
import { dataBreachQuiz } from "./data-breach";
import { aiAttackQuiz } from "./ai-attack";
import { advancedAttacksQuiz } from "./advanced-attacks";
import { ddosQuiz } from "./ddos";
import { networkAttackQuiz } from "./network-attack";
import { webAttackQuiz } from "./web-attack";
import { wifiAttackQuiz } from "./wifi-attack";
import { STAGE_ORDER, type ModuleQuiz, type StageKey } from "./types";

export * from "./types";

// Daftarkan soal materi lain di sini. Materi yang belum terdaftar
// hanya punya langkah topik (tahap latihan/simulasi/quiz dilewati).
const quizzes: Record<string, ModuleQuiz> = {
  phishing: phishingQuiz,
  "password-attack": passwordQuiz,
  "social-engineering": socialEngineeringQuiz,
  "scam-online": scamOnlineQuiz,
  malware: malwareQuiz,
  "qr-code-attack": qrCodeAttackQuiz,
  "ecommerce-fraud": ecommerceFraudQuiz,
  "mobile-banking" : mobileBankingQuiz,
  "account-takeover": accountTakeoverQuiz,
  "data-breach": dataBreachQuiz,
  "ai-attack": aiAttackQuiz,
  "advanced-attacks": advancedAttacksQuiz,
  ddos: ddosQuiz,
  "network-attack": networkAttackQuiz,
  "web-attack": webAttackQuiz,
  "wifi-attack": wifiAttackQuiz,
};

export function getQuiz(slug: string): ModuleQuiz {
  const q = quizzes[slug] ?? {};
  // Soal latihan & simulasi lama ikut masuk ke quiz, setelah soal quiz.
  return { quiz: [...(q.quiz ?? []), ...(q.latihan ?? []), ...(q.simulasi ?? [])] };
}

export function availableStages(slug: string): StageKey[] {
  const q = getQuiz(slug);
  return STAGE_ORDER.filter((s) => (q[s]?.length ?? 0) > 0);
}