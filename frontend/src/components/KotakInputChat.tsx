"use client";

// Kotak input chat: kolom teks + tombol "+" di kiri + tombol kirim di kanan.
//
// Tombol "+" membuka menu kecil dengan satu pilihan: "Upload audio".
// Setelah audio dipilih, muncul kartu lampiran di atas kolom teks (nama + jenis file,
// bisa dihapus dengan tombol X). Audio baru dianalisis saat tombol kirim ditekan.
//
// Dipakai bersama oleh halaman chatbot (varian "halaman", ikut tema terang/gelap)
// dan widget (varian "widget", selalu gelap).

import { useEffect, useRef, useState, type Ref } from "react";
import { Plus, Send, Loader2, X, AudioLines } from "lucide-react";

interface Props {
  nilai: string;
  onUbah: (teks: string) => void;
  /** Dipanggil saat pengguna mengirim teks. Induk yang membaca nilai dan mengosongkannya. */
  onKirimTeks: () => void;
  /** Dipanggil saat pengguna mengirim audio yang dilampirkan. */
  onKirimAudio: (file: File) => void;
  sedangMemproses: boolean;
  placeholder: string;
  inputRef?: Ref<HTMLInputElement>;
  varian?: "halaman" | "widget";
}

// Sama dengan aturan di backend (/voice/analyze)
const EKSTENSI_AUDIO = ["wav", "mp3", "flac", "m4a", "ogg", "opus"];
const UKURAN_MAKS_MB = 25;

// Kelas Tailwind ditulis lengkap (bukan disusun dari potongan) supaya terbaca oleh Tailwind.
const GAYA = {
  halaman: {
    kotak:
      "relative w-full rounded-2xl border border-slate-200 bg-slate-100 shadow-inner transition-all focus-within:border-blue-500/50 focus-within:bg-white dark:border-white/10 dark:bg-white/[0.05] dark:focus-within:bg-white/[0.08]",
    baris: "flex items-center gap-1.5 p-1.5",
    input:
      "min-w-0 flex-1 bg-transparent px-2 py-2.5 text-[15px] font-bold text-slate-900 placeholder-slate-400 outline-none disabled:cursor-not-allowed dark:text-white dark:placeholder-gray-600",
    plus:
      "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-slate-500 transition-all hover:bg-slate-200 hover:text-blue-600 active:scale-95 disabled:opacity-30 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-blue-400",
    kirim:
      "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-[0_4px_20px_rgba(37,99,235,0.3)] transition-all hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 dark:shadow-blue-500/20 dark:hover:bg-blue-500",
    menu:
      "absolute bottom-full left-0 z-30 mb-2 min-w-[220px] rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl dark:border-white/10 dark:bg-[#161a22]",
    menuItem:
      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:text-gray-200 dark:hover:bg-white/10",
    menuIkon: "text-blue-600 dark:text-blue-400",
    kartu: "relative flex h-24 w-28 flex-col justify-between rounded-2xl bg-slate-200 p-3 dark:bg-white/10",
    kartuJenis: "text-[10px] font-extrabold tracking-wide text-slate-500 dark:text-gray-400",
    kartuNama: "truncate text-xs font-bold text-slate-800 dark:text-gray-100",
    hapus:
      "absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-700 text-white shadow transition-colors hover:bg-slate-900 dark:bg-slate-500 dark:hover:bg-slate-400",
    galat: "px-4 pt-2.5 text-[11px] font-bold text-red-600 dark:text-red-400",
    ikon: 18,
  },
  widget: {
    kotak:
      "relative w-full rounded-2xl border border-white/10 bg-white/[0.04] transition-all focus-within:border-blue-500/50 focus-within:bg-white/[0.06]",
    baris: "flex items-center gap-1 p-1",
    input:
      "min-w-0 flex-1 bg-transparent px-2 py-2.5 text-xs font-medium text-white placeholder-gray-600 outline-none disabled:cursor-not-allowed",
    plus:
      "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-gray-400 transition-all hover:bg-white/10 hover:text-blue-400 active:scale-95 disabled:opacity-30",
    kirim:
      "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition-all hover:bg-blue-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30",
    menu:
      "absolute bottom-full left-0 z-30 mb-2 min-w-[200px] rounded-2xl border border-white/10 bg-[#161a22] p-1.5 shadow-2xl",
    menuItem:
      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-200 transition-colors hover:bg-white/10",
    menuIkon: "text-blue-400",
    kartu: "relative flex h-20 w-24 flex-col justify-between rounded-2xl bg-white/10 p-2.5",
    kartuJenis: "text-[9px] font-extrabold tracking-wide text-gray-400",
    kartuNama: "truncate text-[11px] font-bold text-gray-100",
    hapus:
      "absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-500 text-white shadow transition-colors hover:bg-slate-400",
    galat: "px-3 pt-2 text-[10px] font-bold text-red-400",
    ikon: 16,
  },
} as const;

function pecahNama(nama: string): { dasar: string; jenis: string } {
  const titik = nama.lastIndexOf(".");
  if (titik <= 0) return { dasar: nama, jenis: "AUDIO" };
  return { dasar: nama.slice(0, titik), jenis: nama.slice(titik + 1).toUpperCase() };
}

export default function KotakInputChat({
  nilai,
  onUbah,
  onKirimTeks,
  onKirimAudio,
  sedangMemproses,
  placeholder,
  inputRef,
  varian = "halaman",
}: Props) {
  const g = GAYA[varian];
  const [menuTerbuka, setMenuTerbuka] = useState(false);
  const [lampiran, setLampiran] = useState<File | null>(null);
  const [galat, setGalat] = useState("");
  const pembungkusRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Tutup menu saat klik di luar kotak atau menekan Escape
  useEffect(() => {
    if (!menuTerbuka) return;
    const klikLuar = (e: MouseEvent) => {
      if (pembungkusRef.current && !pembungkusRef.current.contains(e.target as Node)) {
        setMenuTerbuka(false);
      }
    };
    const tombol = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuTerbuka(false);
    };
    document.addEventListener("mousedown", klikLuar);
    document.addEventListener("keydown", tombol);
    return () => {
      document.removeEventListener("mousedown", klikLuar);
      document.removeEventListener("keydown", tombol);
    };
  }, [menuTerbuka]);

  const pilihFile = (file: File | undefined) => {
    if (!file) return;
    const ekstensi = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!EKSTENSI_AUDIO.includes(ekstensi)) {
      setLampiran(null);
      setGalat("Format belum didukung. Gunakan file audio WAV, MP3, FLAC, M4A, OGG, atau OPUS.");
      return;
    }
    if (file.size > UKURAN_MAKS_MB * 1024 * 1024) {
      setLampiran(null);
      setGalat(`Ukuran file terlalu besar. Maksimal ${UKURAN_MAKS_MB} MB.`);
      return;
    }
    setGalat("");
    setLampiran(file);
  };

  const kirim = () => {
    if (sedangMemproses) return;
    if (lampiran) {
      onKirimAudio(lampiran);
      setLampiran(null);
      return;
    }
    if (nilai.trim()) onKirimTeks();
  };

  const kartu = lampiran ? pecahNama(lampiran.name) : null;

  return (
    <div ref={pembungkusRef} className={g.kotak}>
      {/* Menu tombol "+" (hanya satu pilihan) */}
      {menuTerbuka && (
        <div role="menu" className={g.menu}>
          <button
            type="button"
            role="menuitem"
            className={g.menuItem}
            onClick={() => {
              setMenuTerbuka(false);
              fileRef.current?.click();
            }}
          >
            <AudioLines size={g.ikon} className={g.menuIkon} />
            Upload audio
          </button>
        </div>
      )}

      {/* Kartu lampiran audio */}
      {kartu && lampiran && (
        <div className="px-3 pt-3">
          <div className={g.kartu} title={lampiran.name}>
            <span className={g.kartuJenis}>{kartu.jenis}</span>
            <span className={g.kartuNama}>{kartu.dasar}</span>
            <button
              type="button"
              onClick={() => setLampiran(null)}
              aria-label="Hapus lampiran audio"
              className={g.hapus}
            >
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      {galat && <p className={g.galat} role="alert">{galat}</p>}

      <form
        onSubmit={e => {
          e.preventDefault();
          kirim();
        }}
        className={g.baris}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".wav,.mp3,.flac,.m4a,.ogg,.opus,audio/*"
          className="hidden"
          onChange={e => {
            pilihFile(e.target.files?.[0]);
            e.target.value = ""; // supaya file yang sama bisa dipilih lagi
          }}
        />

        <button
          type="button"
          onClick={() => setMenuTerbuka(v => !v)}
          disabled={sedangMemproses}
          aria-label="Tambah lampiran"
          aria-haspopup="menu"
          aria-expanded={menuTerbuka}
          className={g.plus}
        >
          <Plus
            size={g.ikon + 4}
            className={`transition-transform duration-200 ${menuTerbuka ? "rotate-45" : ""}`}
          />
        </button>

        <input
          ref={inputRef}
          value={nilai}
          onChange={e => onUbah(e.target.value)}
          disabled={!!lampiran}
          placeholder={lampiran ? "Rekaman siap, tekan kirim" : placeholder}
          className={g.input}
        />

        <button
          type="submit"
          disabled={sedangMemproses || (!lampiran && !nilai.trim())}
          aria-label="Kirim"
          className={g.kirim}
        >
          {sedangMemproses ? <Loader2 size={g.ikon} className="animate-spin" /> : <Send size={g.ikon} />}
        </button>
      </form>
    </div>
  );
}