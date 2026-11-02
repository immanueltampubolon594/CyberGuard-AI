// ─────────────────────────────────────────────────────────────────
// src/app/lib/chatSync.ts
// Satu-satunya pengatur penyimpanan riwayat chat.
// Dipakai oleh halaman chatbot (chatbot/page.tsx) DAN ChatWidget.tsx,
// sehingga keduanya selalu membaca/menulis data yang sama.
//
// - Riwayat dipisah per akun: key localStorage berisi email akun.
// - localStorage = cache cepat di browser.
// - Supabase (lewat backend /chat/*) = data utama, supaya riwayat
//   ikut ke perangkat lain dan tidak tercampur antar-akun.
// ─────────────────────────────────────────────────────────────────

import { getUserEmail } from "./user";

export const SYNC_EVENT = "cyberguard_sync";
const LEGACY_KEY = "cyberguard_history";          // key lama (dipakai bersama semua akun)
const LEGACY_STATS_KEY = "cyberguard_topic_stats"; // key statistik lama
const API = process.env.NEXT_PUBLIC_API_URL;

export interface Message {
  role: string;
  text: string;
  timestamp?: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  isPinned?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

interface SyncDetail {
  email: string;
  sessions: ChatSession[];
}

// ── Identitas akun ───────────────────────────────────────────────

/** true jika ada akun yang login (bukan "guest") */
export function isLoggedIn(): boolean {
  return getUserEmail() !== "guest";
}

/** Email persis seperti yang tersimpan di database (tanpa diubah huruf kecil) */
function serverEmail(): string {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}").email || "";
  } catch {
    return "";
  }
}

/** Key riwayat chat milik akun yang sedang login */
export const storageKey = (email = getUserEmail()) => `cyberguard_history_${email}`;

/** Key statistik "Sering Ditanyakan" milik akun yang sedang login */
export const statsKey = (email = getUserEmail()) => `cyberguard_topic_stats_${email}`;

/** Hapus data lama yang dulu dipakai bersama semua akun */
export function clearLegacyHistory(): void {
  try {
    localStorage.removeItem(LEGACY_KEY);
    localStorage.removeItem(LEGACY_STATS_KEY);
  } catch {}
}

// ── Baca / tulis lokal ───────────────────────────────────────────

/** Baca semua sesi milik akun yang sedang login */
export function readSessions(): ChatSession[] {
  if (!isLoggedIn()) return [];
  try {
    const raw = localStorage.getItem(storageKey());
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Tulis sesi ke localStorage akun ini, beri tahu komponen lain
 * (halaman chatbot / widget), lalu jadwalkan sinkron ke Supabase.
 */
export function writeSessions(data: ChatSession[]): void {
  if (!isLoggedIn()) return;
  const email = getUserEmail();
  try {
    localStorage.setItem(storageKey(email), JSON.stringify(data));
  } catch {}
  window.dispatchEvent(
    new CustomEvent<SyncDetail>(SYNC_EVENT, { detail: { email, sessions: data } })
  );
  queueServerSync(email, serverEmail(), data);
}

/**
 * Pasang listener sync — panggil di useEffect, kembalikan fungsi cleanup.
 * includeSameTab=false dipakai halaman chatbot, karena halaman itu sudah
 * menulis sendiri setiap kali state berubah (mencegah loop).
 */
export function attachSyncListener(
  onUpdate: (sessions: ChatSession[]) => void,
  includeSameTab = true
): () => void {
  // Tab lain: event "storage" untuk key milik akun ini saja
  const handleStorage = (e: StorageEvent) => {
    if (e.key === storageKey() && e.newValue) {
      try {
        onUpdate(JSON.parse(e.newValue));
      } catch {}
    }
  };

  // Tab yang sama: custom event, hanya jika akunnya sama
  const handleSync = (e: Event) => {
    const detail = (e as CustomEvent<SyncDetail>).detail;
    if (detail && detail.email === getUserEmail()) onUpdate(detail.sessions);
  };

  window.addEventListener("storage", handleStorage);
  if (includeSameTab) window.addEventListener(SYNC_EVENT, handleSync);

  return () => {
    window.removeEventListener("storage", handleStorage);
    if (includeSameTab) window.removeEventListener(SYNC_EVENT, handleSync);
  };
}

// ── Sinkron ke Supabase ──────────────────────────────────────────

// Versi terakhir tiap sesi yang sudah tersimpan di server, per akun.
// Dipakai agar yang dikirim hanya sesi yang berubah.
const synced = new Map<string, Map<string, string>>();
const fingerprint = (s: ChatSession) => JSON.stringify([s.title, s.messages]);

let timer: ReturnType<typeof setTimeout> | undefined;
let pending: { email: string; dbEmail: string; data: ChatSession[] } | null = null;
let running = false;

function queueServerSync(email: string, dbEmail: string, data: ChatSession[]) {
  if (!API || !dbEmail) return;
  pending = { email, dbEmail, data };
  clearTimeout(timer);
  timer = setTimeout(flush, 800); // tunggu sebentar agar ketikan beruntun cukup 1x kirim
}

async function flush() {
  if (running) {
    timer = setTimeout(flush, 800);
    return;
  }
  const job = pending;
  pending = null;
  if (!job) return;
  running = true;

  const known = synced.get(job.email) ?? new Map<string, string>();
  const currentIds = new Set(job.data.map((s) => s.id));

  try {
    // 1. Simpan sesi yang baru / berubah
    for (const s of job.data) {
      // Sesi yang belum berisi pertanyaan pengguna tidak perlu disimpan
      if (!s.messages.some((m) => m.role === "user")) continue;
      const fp = fingerprint(s);
      if (known.get(s.id) === fp) continue;
      try {
        const res = await fetch(`${API}/chat/save`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_email: job.dbEmail,
            session_id: s.id,
            title: s.title,
            messages: s.messages,
          }),
        });
        if (res.ok) known.set(s.id, fp);
      } catch {}
    }

    // 2. Hapus di server sesi yang sudah dihapus pengguna
    for (const id of Array.from(known.keys())) {
      if (currentIds.has(id)) continue;
      try {
        const res = await fetch(`${API}/chat/delete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_email: job.dbEmail, session_id: id }),
        });
        if (res.ok) known.delete(id);
      } catch {}
    }
  } finally {
    synced.set(job.email, known);
    running = false;
  }
}

/**
 * Ambil riwayat akun ini dari Supabase, gabungkan dengan cache lokal,
 * lalu simpan hasilnya. Mengembalikan null jika server tidak bisa dihubungi
 * (chat tetap jalan memakai data lokal).
 */
export async function loadFromServer(): Promise<ChatSession[] | null> {
  const email = getUserEmail();
  const dbEmail = serverEmail();
  if (email === "guest" || !dbEmail || !API) return null;

  try {
    const res = await fetch(`${API}/chat/history/${encodeURIComponent(dbEmail)}`);
    if (!res.ok) return null;
    const body = await res.json();
    const rows: any[] = body.sessions ?? [];

    // Akun sudah berganti selama menunggu → abaikan hasilnya
    if (getUserEmail() !== email) return null;

    const local = readSessions();
    const localMap = new Map(local.map((s) => [s.id, s]));
    const known = synced.get(email) ?? new Map<string, string>();
    const merged: ChatSession[] = [];

    for (const row of rows) {
      const server: ChatSession = {
        id: String(row.session_id),
        title: row.title || "Chat Baru",
        messages: Array.isArray(row.messages) ? row.messages : [],
        createdAt: Date.parse(row.created_at) || undefined,
        updatedAt: Date.parse(row.updated_at) || undefined,
      };
      known.set(server.id, fingerprint(server));

      const loc = localMap.get(server.id);
      localMap.delete(server.id);
      if (loc && loc.messages.length > server.messages.length) {
        merged.push(loc); // versi lokal lebih baru → nanti dikirim ulang ke server
      } else {
        merged.push({ ...server, isPinned: loc?.isPinned }); // pin hanya disimpan lokal
      }
    }

    // Sesi lokal yang belum ada di server tetap dipertahankan (akan diunggah)
    localMap.forEach((s) => merged.push(s));

    merged.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
    synced.set(email, known);
    writeSessions(merged);
    return merged;
  } catch {
    return null;
  }
}