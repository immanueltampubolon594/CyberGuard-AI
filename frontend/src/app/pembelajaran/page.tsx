"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Bug, UserRound, Lock, Wifi,
  ChevronRight, Brain, Smartphone,
  Crosshair, AlertTriangle,
  Search, Database, Key, Network, CreditCard, Mail,
  ChevronDown, ChevronUp, BookOpen, Check,
  Siren, Globe, ShoppingCart,
} from "lucide-react";
import { moduleMeta } from "../lib/modules";
import { getModuleState, getSteps, type ModuleState, type ModuleStatus } from "../lib/learningApi";
import { useLearning } from "../lib/useLearning";
import CyberLogoMarquee from "@/components/CyberLogoMarquee";

interface Materi {
  id: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  thumbnail: string;
  accentColor: string;
  categories: string[];
}

const allMateri: Materi[] = [
  {
    id: "phishing",
    icon: <Mail size={28} />,
    thumbnail: "/materi/phishing.jpg",
    accentColor: "rgba(99,102,241,0.7)",
    title: "Phishing",
    desc: "Penipuan untuk mencuri akun, password, dan data korban dengan menyamar sebagai pihak terpercaya seperti bank, marketplace, atau instansi resmi.",
    categories: ["Serangan Sosial", "Serangan Identitas"],
  },
  {
    id: "social-engineering",
    icon: <UserRound size={28} />,
    thumbnail: "/materi/social-engineering.jpg",
    accentColor: "rgba(148,163,184,0.7)",
    title: "Social Engineering",
    desc: "Manipulasi psikologis untuk menipu korban agar menyerahkan informasi atau akses secara sukarela tanpa disadari.",
    categories: ["Serangan Sosial"],
  },
  {
    id: "password-attack",
    icon: <Lock size={28} />,
    thumbnail: "/materi/password-attack.jpg",
    accentColor: "rgba(34,211,238,0.7)",
    title: "Password Attack",
    desc: "Serangan untuk mendapatkan kata sandi akun melalui berbagai metode teknis seperti menebak, memaksa, atau menggunakan data bocor.",
    categories: ["Serangan Identitas"],
  },
  {
    id: "scam-online",
    icon: <CreditCard size={28} />,
    thumbnail: "/materi/scam-online.jpg",
    accentColor: "rgba(251,191,36,0.7)",
    title: "Scam & Penipuan Online",
    desc: "Berbagai modus penipuan digital yang memanfaatkan kepercayaan korban untuk keuntungan finansial melalui platform belanja dan media sosial.",
    categories: ["Serangan Finansial", "Serangan Sosial"],
  },
  {
    id: "ecommerce-fraud",
    icon: <ShoppingCart size={28} />,
    thumbnail: "/materi/ecommerce-fraud.jpg",
    accentColor: "rgba(236,72,153,0.7)",
    title: "E-Commerce Fraud",
    desc: "Penipuan dalam transaksi e-commerce seperti toko palsu, payment fraud, account takeover, dan refund fraud yang merugikan pembeli dan penjual.",
    categories: ["Serangan Finansial"],
  },
  {
    id: "malware",
    icon: <Bug size={28} />,
    thumbnail: "/materi/malware.jpg",
    accentColor: "rgba(248,113,113,0.7)",
    title: "Malware",
    desc: "Program berbahaya yang dirancang untuk merusak, mencuri, atau mendapatkan akses ilegal ke sistem dan perangkat korban.",
    categories: ["Sistem & Infrastruktur"],
  },
  {
    id: "wifi-attack",
    icon: <Wifi size={28} />,
    thumbnail: "/materi/wifi-attack.jpg",
    accentColor: "rgba(52,211,153,0.7)",
    title: "WiFi Attack",
    desc: "Serangan pada jaringan wireless untuk membobol, menyadap, atau mengalihkan koneksi pengguna di jaringan publik maupun privat.",
    categories: ["Serangan Jaringan"],
  },
  {
    id: "mobile-banking",
    icon: <Smartphone size={28} />,
    thumbnail: "/materi/mobile-banking.jpg",
    accentColor: "rgba(167,139,250,0.7)",
    title: "Mobile Banking Attack",
    desc: "Serangan yang menargetkan aplikasi perbankan mobile untuk mencuri dana dan data finansial nasabah secara diam-diam.",
    categories: ["Serangan Finansial", "Serangan Identitas"],
  },
  {
    id: "data-breach",
    icon: <Database size={28} />,
    thumbnail: "/materi/data-breach.jpg",
    accentColor: "rgba(74,222,128,0.7)",
    title: "Data Breach",
    desc: "Kebocoran data pengguna akibat serangan siber, kesalahan konfigurasi sistem, atau tindakan orang dalam yang merugikan.",
    categories: ["Serangan Identitas", "Sistem & Infrastruktur"],
  },
  {
    id: "account-takeover",
    icon: <Key size={28} />,
    thumbnail: "/materi/account-takeover.jpg",
    accentColor: "rgba(232,121,249,0.7)",
    title: "Account Takeover",
    desc: "Pengambilalihan akun digital korban melalui berbagai teknik pencurian sesi, identitas, dan kredensial yang sudah bocor.",
    categories: ["Serangan Identitas"],
  },
  {
    id: "qr-code-attack",
    icon: <Crosshair size={28} />,
    thumbnail: "/materi/qr-code-attack.jpg",
    accentColor: "rgba(30, 51, 77, 0.7)",
    title: "QR Code Attack",
    desc: "Eksploitasi kode QR untuk mengarahkan korban ke situs phishing, mengunduh malware, atau mengalihkan pembayaran QRIS ke rekening penipu.",
    categories: ["Serangan Sosial", "Serangan Finansial"],
  },
  {
    id: "web-attack",
    icon: <Globe size={28} />,
    thumbnail: "/materi/web-attack.jpg",
    accentColor: "rgba(251,146,60,0.7)",
    title: "Web Attack",
    desc: "Serangan yang menargetkan aplikasi dan situs web untuk mencuri data, memanipulasi sistem, atau mengambil alih server secara penuh.",
    categories: ["Sistem & Infrastruktur"],
  },
  {
    id: "network-attack",
    icon: <Network size={28} />,
    thumbnail: "/materi/network-attack.jpg",
    accentColor: "rgba(56,189,248,0.7)",
    title: "Network Attack",
    desc: "Serangan pada infrastruktur jaringan untuk menyadap, memanipulasi, atau memutus komunikasi antara dua atau lebih pihak.",
    categories: ["Serangan Jaringan"],
  },
  {
    id: "ddos",
    icon: <Siren size={28} />,
    thumbnail: "/materi/ddos.jpg",
    accentColor: "rgba(252,165,165,0.7)",
    title: "DDoS / DoS Attack",
    desc: "Server atau layanan dibanjiri traffic secara masif hingga tidak dapat melayani pengguna normal dan infrastruktur menjadi lumpuh.",
    categories: ["Serangan Jaringan", "Sistem & Infrastruktur"],
  },
  {
    id: "ai-attack",
    icon: <Brain size={28} />,
    thumbnail: "/materi/ai-attack.jpg",
    accentColor: "rgba(165,180,252,0.7)",
    title: "AI Cyber Attack",
    desc: "Serangan siber yang memanfaatkan kecerdasan buatan untuk menciptakan penipuan, deepfake, dan serangan yang jauh lebih sulit dideteksi.",
    categories: ["Serangan Sosial", "Serangan Identitas"],
  },
  {
    id: "advanced-attacks",
    icon: <Crosshair size={28} />,
    thumbnail: "/materi/advanced-attacks.jpg",
    accentColor: "rgba(203,213,225,0.7)",
    title: "Advanced Attacks",
    desc: "Serangan tingkat lanjut yang digunakan aktor negara dan kelompok peretas profesional untuk menarget infrastruktur kritis.",
    categories: ["Sistem & Infrastruktur", "Serangan Jaringan"],
  },
];

const kategoriOptions = [
  "Serangan Sosial",
  "Serangan Identitas",
  "Serangan Jaringan",
  "Serangan Finansial",
  "Sistem & Infrastruktur",
];

const STATUS_BUTTONS: { key: ModuleStatus; label: string }[] = [
  { key: "belum_dimulai", label: "Belum Dimulai" },
  { key: "sedang_dipelajari", label: "Sedang Dipelajari" },
  { key: "selesai", label: "Selesai" },
];

interface Row {
  materi: Materi;
  labels: string[];
  steps: string[];
  state: ModuleState;
}

function StatusBadge({ state }: { state: ModuleState }) {
  if (state.status === "selesai") {
    return (
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-[10px] font-black uppercase tracking-wider">
          <Check size={11} strokeWidth={3} /> Selesai
        </span>
        {state.passed && (
          <span className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-500 text-[10px] font-black uppercase tracking-wider">
            Lulus Quiz
          </span>
        )}
        {state.hasNewContent && (
          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[10px] font-black uppercase tracking-wider">
            Materi Baru
          </span>
        )}
      </div>
    );
  }
  if (state.status === "sedang_dipelajari") {
    return (
      <span className="inline-flex px-2.5 py-1 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider">
        Sedang Dipelajari
      </span>
    );
  }
  return (
    <span className="inline-flex px-2.5 py-1 rounded-full border border-slate-300 dark:border-white/15 text-slate-500 text-[10px] font-black uppercase tracking-wider">
      Belum Dimulai
    </span>
  );
}

function MateriCard({ row }: { row: Row }) {
  const { materi, labels, steps, state } = row;
  const [expanded, setExpanded] = useState(false);
  const buttonLabel =
    state.status === "selesai" ? "Pelajari Lagi" : state.status === "sedang_dipelajari" ? "Lanjutkan" : "Mulai Belajar";

  return (
    <div className="group bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-white/[0.08] rounded-[2rem] overflow-hidden transition-all duration-500 hover:border-blue-500/50 hover:shadow-[0_30px_60px_-15px_rgba(37,99,235,0.2)] flex flex-col">
      <div className="relative h-52 overflow-hidden bg-slate-900">
        <img
          src={materi.thumbnail}
          alt={materi.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c1322] via-[#0c1322]/40 to-transparent" />
        <div className="absolute top-5 right-5">
          <div className="p-2 rounded-xl bg-blue-600/90 backdrop-blur-sm border border-blue-400/30 text-white shadow-lg">
            {materi.icon}
          </div>
        </div>
        <div className="absolute bottom-5 left-6">
          <h3 className="text-white font-black text-2xl uppercase tracking-tighter mb-1">{materi.title}</h3>
          <div className="flex items-center gap-2 text-blue-400 text-[10px] font-bold uppercase tracking-widest">
            <BookOpen size={12} /> {labels.length} Topik Terenkripsi
          </div>
        </div>
      </div>

      <div className="p-7 flex-1 flex flex-col">
        <div className="mb-4"><StatusBadge state={state} /></div>
        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6 line-clamp-2">{materi.desc}</p>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500">Progress</span>
            <span className="text-[11px] font-black text-slate-700 dark:text-slate-300">{state.percent}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${state.status === "selesai" ? "bg-emerald-500" : "bg-blue-600"}`}
              style={{ width: `${state.percent}%` }}
            />
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-blue-500 transition-colors uppercase tracking-[2px]"
          >
            <div className={`p-1.5 rounded-lg transition-all ${expanded ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" : "bg-slate-100 dark:bg-white/5"}`}>
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </div>
            {expanded ? "Hide Topik" : "Show Topik"}
          </button>
          <Link
            href={`/pembelajaran/${materi.id}`}
            className="px-7 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[11px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 dark:hover:text-white transition-all shadow-xl active:scale-95 flex items-center gap-2"
          >
            {buttonLabel} <ChevronRight size={14} strokeWidth={3} />
          </Link>
        </div>
      </div>

      {expanded && (
        <div className="px-7 pb-7">
          <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-black/30 border border-slate-100 dark:border-white/5 font-mono">
            {labels.map((label, i) => {
              const step = `topic-${i}`;
              const done = state.done.includes(step) || state.completed;
              const open = done || state.nextStep === step || state.completed;
              const body = (
                <div className="flex items-center justify-between p-3 rounded-xl border border-transparent">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-blue-500/50 tracking-tighter">[{String(i).padStart(2, "0")}]</span>
                    <span className={`text-xs font-bold ${open ? "text-slate-500 dark:text-slate-400" : "text-slate-300 dark:text-slate-700"}`}>
                      {label}
                    </span>
                  </div>
                  {done ? <Check size={12} className="text-emerald-500" /> : !open ? <Lock size={11} className="text-slate-400" /> : null}
                </div>
              );
              return open ? (
                <Link
                  key={i}
                  href={`/pembelajaran/${materi.id}?step=${step}`}
                  className="block rounded-xl hover:bg-white dark:hover:bg-white/5 hover:border-blue-500/20 transition-all"
                >
                  {body}
                </Link>
              ) : (
                <div key={i} className="cursor-not-allowed">{body}</div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PembelajaranPage() {
  const { store } = useLearning();
  const [searchQuery, setSearchQuery] = useState("");
  const [kategori, setKategori] = useState("Semua");
  const [status, setStatus] = useState<ModuleStatus | null>(null);

  const rows: Row[] = useMemo(
    () =>
      allMateri.map((m) => {
        const meta = moduleMeta[m.id];
        const steps = getSteps(m.id, meta?.topicIds ?? []);
        return { materi: m, labels: meta?.topicLabels ?? [], steps, state: getModuleState(store[m.id], steps) };
      }),
    [store]
  );

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return rows.filter(({ materi: m, state }) => {
      const matchSearch = !q || m.title.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q);
      const matchKategori = kategori === "Semua" || m.categories.includes(kategori);
      const matchStatus = !status || state.status === status;
      return matchSearch && matchKategori && matchStatus;
    });
  }, [rows, searchQuery, kategori, status]);

  const counts = {
    belum_dimulai: rows.filter((r) => r.state.status === "belum_dimulai").length,
    sedang_dipelajari: rows.filter((r) => r.state.status === "sedang_dipelajari").length,
    selesai: rows.filter((r) => r.state.status === "selesai").length,
  };
  const overall = Math.round(rows.reduce((s, r) => s + r.state.percent, 0) / (rows.length || 1));
  const passedCount = rows.filter((r) => r.state.passed).length;
  const hasFilter = searchQuery !== "" || kategori !== "Semua" || status !== null;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white font-sans transition-colors duration-500">
      <Navbar />

      {/* ── HERO — overflow-x-hidden dipindahkan ke sini saja ── */}
      <section className="relative min-h-[420px] flex items-center border-b border-slate-200 dark:border-white/[0.06] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.018]" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "52px 52px",
        }} />
        <div className="absolute top-0 left-0 w-[40%] h-full bg-blue-600/5 blur-[120px] pointer-events-none" />

        <div className="absolute top-0 bottom-0 right-0 pointer-events-none select-none" style={{ width: "55%" }}>
          <img src="/cyber-team.png" alt="Cyber Security Team" className="w-full h-full object-cover object-center" style={{ opacity: 0.8 }} />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-slate-50/50 to-transparent dark:from-[#020617] dark:via-[#020617]/50 dark:to-transparent z-10" />
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-slate-50 to-transparent dark:from-[#020617] dark:to-transparent z-10" />
        </div>

        <div className="relative z-10 w-full max-w-[1600px] mx-auto px-8 md:px-16 xl:px-20 py-20">
          <div className="max-w-[560px]">
            <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-slate-300 dark:border-white/10 bg-slate-200/50 dark:bg-white/5 text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-[5px] shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Platform Keamanan Siber
            </div>
            <p className="text-blue-400 text-xs font-black tracking-[4px] uppercase mb-4 opacity-80">RAG Engine Knowledge Base V1.0</p>
            <h1 className="font-black uppercase leading-[0.95] tracking-tight mb-6">
              <span className="block text-[clamp(1.4rem,3.5vw,3.5rem)] text-slate-900 dark:text-white">
                CYBER <span className="text-blue-600 dark:text-blue-400">INTELLIGENCE</span>
              </span>
              <span className="block text-[clamp(1.4rem,3.5vw,3.5rem)] text-slate-900 dark:text-white">
                HUB
              </span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-[15px] leading-relaxed mb-10 max-w-[440px]">
              Bongkar rahasia serangan digital dengan teknologi{" "}
              <strong className="text-slate-900 dark:text-white">Artificial Intelligence</strong>. Eksplorasi
              ancaman nyata dan bangun benteng pertahanan siber Anda hari ini.
            </p>
            <button
              onClick={() => {
                const element = document.getElementById("Topik");
                if (element) {
                  const y = element.getBoundingClientRect().top + window.pageYOffset - 110;
                  window.scrollTo({ top: y, behavior: "smooth" });
                }
              }}
              className="flex items-center gap-3 bg-blue-600/80 backdrop-blur-sm border border-blue-400/30 text-white font-black text-sm uppercase tracking-[3px] px-6 py-3 rounded-2xl transition-all hover:bg-blue-600 shadow-xl active:scale-95 w-fit"
            >
              Mulai Belajar <ChevronRight size={16} strokeWidth={3} />
            </button>
          </div>
        </div>
      </section>
    <CyberLogoMarquee />
      {/* ── DAFTAR MATERI ── */}
      <div id="Topik" className="w-full max-w-[1600px] mx-auto px-8 md:px-16 xl:px-20 py-12">
        {/* Ringkasan progress */}
        <div className="mb-8 flex flex-wrap items-center gap-x-8 gap-y-3 p-5 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.02]">
          <div className="flex-1 min-w-[220px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[3px]">Progress Belajarmu</span>
              <span className="text-sm font-black text-slate-900 dark:text-white">{overall}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div className="h-full rounded-full bg-blue-600 transition-all duration-500" style={{ width: `${overall}%` }} />
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            <span className="font-black text-slate-900 dark:text-white">{counts.selesai}</span> dari {rows.length} materi selesai
            {" · "}
            <span className="font-black text-slate-900 dark:text-white">{passedCount}</span> lulus quiz
          </p>
        </div>

        {/* Pencarian, kategori, status (sesuai mockup) */}
        <div className="flex flex-col lg:flex-row gap-3 mb-3 lg:sticky lg:top-[104px] lg:z-40 lg:-mx-4 lg:px-4 lg:py-3 lg:rounded-2xl lg:bg-slate-50/90 lg:dark:bg-[#020617]/90 lg:backdrop-blur-xl">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={16} className="text-slate-500" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari materi..."
              className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-500 outline-none focus:border-blue-500/60 transition-all"
            />
          </div>

          <select
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
            className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500/60 cursor-pointer"
          >
            <option value="Semua">Semua Kategori</option>
            {kategoriOptions.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>

          <div className="flex flex-wrap gap-2">
            {STATUS_BUTTONS.map((b) => {
              const active = status === b.key;
              return (
                <button
                  key={b.key}
                  onClick={() => setStatus(active ? null : b.key)}
                  className={`px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
                    active
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 hover:border-blue-500/50"
                  }`}
                >
                  {b.label} <span className={active ? "text-blue-100" : "text-slate-400"}>({counts[b.key]})</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="my-6 border-t border-dashed border-slate-300 dark:border-white/10" />

        <div className="mb-7">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[4px] mb-1">Topik Pembelajaran</p>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            {kategori === "Semua" ? "SEMUA MATERI" : `KATEGORI: ${kategori}`}
            <span className="ml-3 text-sm font-semibold text-slate-600 normal-case tracking-normal">
              ({filtered.length} materi)
            </span>
          </h2>
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-start">
            {filtered.map((row) => (
              <MateriCard key={row.materi.id} row={row} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Search size={32} className="text-slate-700 mb-4" />
            <p className="text-slate-400 font-bold text-lg mb-1">Materi tidak ditemukan</p>
            <p className="text-slate-600 text-sm mb-4">Coba ubah filter atau kata kunci pencarian</p>
            {hasFilter && (
              <button
                onClick={() => { setSearchQuery(""); setKategori("Semua"); setStatus(null); }}
                className="text-sm text-slate-500 dark:text-slate-300 hover:text-blue-500 font-semibold underline underline-offset-4"
              >
                Reset semua filter
              </button>
            )}
          </div>
        )}

        <div className="mt-8 flex items-start gap-3 p-6 rounded-2xl bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] shadow-inner">
          <AlertTriangle size={13} className="text-slate-500 mt-0.5 shrink-0" />
          <p className="text-[12px] text-slate-500 leading-relaxed">
            <span className="text-slate-700 dark:text-slate-300 font-bold">Catatan: </span>
            Seluruh materi dirancang berdasarkan kasus nyata di Indonesia. Setiap sub-topik dilengkapi contoh konkret dan langkah perlindungan yang langsung bisa diterapkan.
          </p>
        </div>
      </div>
    </main>
  );
}
