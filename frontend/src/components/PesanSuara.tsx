// Tampilan hasil analisis suara di chatbot dan widget.
//
// Menerima teks balasan dari susunBalasan() (voiceAnalysis.ts) dan menggambarnya
// menjadi blok yang rapi: judul, kotak kesimpulan berwarna, kutipan, daftar, dan tautan materi.
//
// Sengaja TIDAK memakai react-markdown: format yang dikenali hanya yang dibuat oleh
// susunBalasan(), dan tautan hanya diterima jika menuju halaman /pembelajaran.
// Jadi teks dari AI/transkrip tidak bisa menyelipkan tautan ke situs lain.

import Link from "next/link";

interface Props {
  teks: string;
  /** true = paksa warna gelap (dipakai widget yang selalu gelap) */
  gelap?: boolean;
}

type Blok =
  | { t: "judul"; teks: string }
  | { t: "status"; nada: "bahaya" | "aman" | "info"; teks: string }
  | { t: "label"; teks: string }
  | { t: "paragraf"; teks: string }
  | { t: "kutipan"; baris: string[] }
  | { t: "daftar"; baris: string[] };

const TAUTAN_AMAN = /^\/pembelajaran(\/[a-z0-9-]+)?(\?step=[a-z0-9-]+)?$/;

function uraikan(teks: string): Blok[] {
  const hasil: Blok[] = [];
  let kumpul: { t: "kutipan" | "daftar"; baris: string[] } | null = null;
  const tutup = () => {
    if (kumpul) hasil.push(kumpul);
    kumpul = null;
  };
  const tambahKumpul = (t: "kutipan" | "daftar", isi: string) => {
    if (kumpul && kumpul.t !== t) tutup();
    if (!kumpul) kumpul = { t, baris: [] };
    kumpul.baris.push(isi);
  };

  for (const mentah of teks.split("\n")) {
    const baris = mentah.trim();
    if (!baris) {
      tutup();
      continue;
    }
    let m: RegExpMatchArray | null;
    if ((m = baris.match(/^###\s+(.+)$/))) {
      tutup();
      hasil.push({ t: "judul", teks: m[1] });
    } else if ((m = baris.match(/^>\s?(.*)$/))) {
      tambahKumpul("kutipan", m[1]);
    } else if ((m = baris.match(/^-\s+(.+)$/))) {
      tambahKumpul("daftar", m[1]);
    } else if ((m = baris.match(/^\*\*(⚠|✅|ℹ)️?\s*(.+?)\*\*$/u))) {
      tutup();
      const nada = m[1] === "⚠" ? "bahaya" : m[1] === "✅" ? "aman" : "info";
      hasil.push({ t: "status", nada, teks: `${m[1]}️ ${m[2]}` });
    } else if ((m = baris.match(/^\*\*([^*]+)\*\*$/))) {
      tutup();
      hasil.push({ t: "label", teks: m[1] });
    } else {
      tutup();
      hasil.push({ t: "paragraf", teks: baris });
    }
  }
  tutup();
  return hasil;
}

// Kelas warna ditulis lengkap (bukan disusun dari potongan) supaya terbaca oleh Tailwind.
const ADAPTIF = {
  judul: "text-slate-900 dark:text-white border-slate-300 dark:border-white/15",
  label: "text-slate-900 dark:text-white",
  muted: "text-slate-500 dark:text-slate-400",
  kutip: "border-amber-500 bg-amber-500/10",
  link: "text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300",
  titik: "bg-blue-500",
  bahaya: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/30",
  aman: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30",
  info: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-white/5 dark:text-slate-300 dark:border-white/10",
};

const GELAP: typeof ADAPTIF = {
  judul: "text-white border-white/15",
  label: "text-white",
  muted: "text-slate-400",
  kutip: "border-amber-500 bg-amber-500/10",
  link: "text-blue-400 hover:text-blue-300",
  titik: "bg-blue-500",
  bahaya: "bg-red-500/10 text-red-300 border-red-500/30",
  aman: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  info: "bg-white/5 text-slate-300 border-white/10",
};

function Inline({ teks, w }: { teks: string; w: typeof ADAPTIF }) {
  const bagian = teks.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\)|_[^_]+_)/g);
  return (
    <>
      {bagian.map((b, i) => {
        if (!b) return null;
        let m: RegExpMatchArray | null;
        if ((m = b.match(/^\*\*([^*]+)\*\*$/))) {
          return <strong key={i} className="font-extrabold">{m[1]}</strong>;
        }
        if ((m = b.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/))) {
          if (!TAUTAN_AMAN.test(m[2])) return <span key={i}>{m[1]}</span>;
          return (
            <Link
              key={i}
              href={m[2]}
              target="_blank"
              rel="noopener noreferrer"
              className={`font-bold underline underline-offset-2 ${w.link}`}
            >
              {m[1]}
              <span aria-hidden="true"> ↗</span>
            </Link>
          );
        }
        if ((m = b.match(/^_([^_]+)_$/))) {
          return <em key={i} className={w.muted}>{m[1]}</em>;
        }
        return <span key={i}>{b}</span>;
      })}
    </>
  );
}

export default function PesanSuara({ teks, gelap = false }: Props) {
  const w = gelap ? GELAP : ADAPTIF;
  const blok = uraikan(teks);

  return (
    <div className="space-y-3 text-left font-medium leading-relaxed break-words whitespace-normal">
      {blok.map((b, i) => {
        switch (b.t) {
          case "judul":
            return (
              <h3 key={i} className={`border-b pb-2 text-[1.05em] font-extrabold tracking-tight ${w.judul}`}>
                {b.teks}
              </h3>
            );
          case "status":
            return (
              <div key={i} className={`rounded-xl border px-3.5 py-2.5 font-bold leading-snug ${w[b.nada]}`}>
                {b.teks}
              </div>
            );
          case "label":
            return (
              <p key={i} className={`-mb-1 pt-1 text-[0.95em] font-extrabold ${w.label}`}>
                {b.teks}
              </p>
            );
          case "kutipan":
            return (
              <div key={i} className="space-y-1.5">
                {b.baris.map((q, j) => (
                  <blockquote
                    key={j}
                    className={`rounded-r-lg border-l-4 px-3 py-2 text-[0.95em] italic ${w.kutip}`}
                  >
                    <Inline teks={q} w={w} />
                  </blockquote>
                ))}
              </div>
            );
          case "daftar":
            return (
              <ul key={i} className="space-y-2">
                {b.baris.map((li, j) => (
                  <li key={j} className="flex gap-2.5">
                    <span aria-hidden="true" className={`mt-[0.6em] h-1.5 w-1.5 flex-shrink-0 rounded-full ${w.titik}`} />
                    <span className="min-w-0">
                      <Inline teks={li} w={w} />
                    </span>
                  </li>
                ))}
              </ul>
            );
          default:
            return (
              <p key={i}>
                <Inline teks={b.teks} w={w} />
              </p>
            );
        }
      })}
    </div>
  );
}