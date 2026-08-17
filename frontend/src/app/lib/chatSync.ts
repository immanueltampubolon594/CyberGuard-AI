// ─────────────────────────────────────────────────────────────────
// sync_helper.ts
// Taruh di: src/lib/chatSync.ts
// Import dan pakai di chatbot_page.tsx dan ChatWidget.tsx
// ─────────────────────────────────────────────────────────────────

export const STORAGE_KEY = "cyberguard_history";
export const SYNC_EVENT  = "cyberguard_sync";

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

/** Baca semua sesi dari localStorage */
export function readSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Tulis sesi ke localStorage DAN broadcast ke semua komponen
 * yang mendengarkan — baik di tab yang sama maupun tab berbeda.
 *
 * Cara kerja:
 * - localStorage.setItem  → memicu "storage" event di TAB LAIN
 * - CustomEvent           → memicu "cyberguard_sync" di TAB YANG SAMA
 *
 * Kedua komponen (chatbot_page & ChatWidget) harus
 * mendengarkan KEDUA event ini.
 */
export function writeSessions(data: ChatSession[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(
    new CustomEvent<ChatSession[]>(SYNC_EVENT, { detail: data })
  );
}

/** Pasang listener sync — panggil di useEffect */
export function attachSyncListener(
  onUpdate: (sessions: ChatSession[]) => void
): () => void {
  // Cross-tab: "storage" event hanya aktif di tab LAIN
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        onUpdate(JSON.parse(e.newValue));
      } catch {}
    }
  };

  // Same-tab: custom event dari komponen lain di tab yang sama
  const handleSync = (e: Event) => {
    const detail = (e as CustomEvent<ChatSession[]>).detail;
    if (detail) onUpdate(detail);
  };

  window.addEventListener("storage",  handleStorage);
  window.addEventListener(SYNC_EVENT, handleSync);

  // Return cleanup function
  return () => {
    window.removeEventListener("storage",  handleStorage);
    window.removeEventListener(SYNC_EVENT, handleSync);
  };
}
