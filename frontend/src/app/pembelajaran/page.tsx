"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useState, useMemo } from "react";
import {
  Bug, UserRound, Lock, Wifi,
  ChevronRight, Shield, Brain, Smartphone, Eye,
  Crosshair, AlertTriangle,
  Search, Database, Key, Network, CreditCard, Mail,
  ChevronDown, ChevronUp, BookOpen,
  BarChart2, Siren, Globe, ShoppingCart,
} from "lucide-react";

interface Materi {
  id: string;
  level: "Dasar" | "Menengah" | "Lanjut";
  title: string;
  desc: string;
  icon: React.ReactNode;
  thumbnail: string;       // path ke /public/materi/<filename>
  accentColor: string;     // warna aksen untuk overlay & icon box
}

// ─── Data Materi ──────────────────────────────────────────────────────────────
// thumbnail → simpan file ke /public/materi/<filename>
// Sumber download ada di DOWNLOAD_GUIDE.md yang disertakan
const allMateri: Materi[] = [
  {
    id: "phishing",
    level: "Dasar", 
    icon: <Mail size={28} />,
    thumbnail: "/materi/phishing.jpg",
    accentColor: "rgba(99,102,241,0.7)",
    title: "Phishing",
    desc: "Penipuan untuk mencuri akun, password, dan data korban dengan menyamar sebagai pihak terpercaya seperti bank, marketplace, atau instansi resmi.",
  },
  {
    id: "social-engineering",
    level: "Dasar",
    icon: <UserRound size={28} />,
    thumbnail: "/materi/social-engineering.jpg",
    accentColor: "rgba(148,163,184,0.7)",
    title: "Social Engineering",
    desc: "Manipulasi psikologis untuk menipu korban agar menyerahkan informasi atau akses secara sukarela tanpa disadari.",
  },
  {
    id: "password-attack",
    level: "Dasar",
    icon: <Lock size={28} />,
    thumbnail: "/materi/password-attack.jpg",
    accentColor: "rgba(34,211,238,0.7)",
    title: "Password Attack",
    desc: "Serangan untuk mendapatkan kata sandi akun melalui berbagai metode teknis seperti menebak, memaksa, atau menggunakan data bocor.",
  },
  {
    id: "scam-online",
    level: "Dasar",
    icon: <CreditCard size={28} />,
    thumbnail: "/materi/scam-online.jpg",
    accentColor: "rgba(251,191,36,0.7)",
    title: "Scam & Penipuan Online",
    desc: "Berbagai modus penipuan digital yang memanfaatkan kepercayaan korban untuk keuntungan finansial melalui platform belanja dan media sosial.",
  },
  {
    id: "ecommerce-fraud",
    level: "Dasar",
    icon: <ShoppingCart size={28} />,
    thumbnail: "/materi/ecommerce-fraud.jpg",
    accentColor: "rgba(236,72,153,0.7)",
    title: "E-Commerce Fraud",
    desc: "Penipuan dalam transaksi e-commerce seperti toko palsu, payment fraud, account takeover, dan refund fraud yang merugikan pembeli dan penjual.",
  },
  {
    id: "malware",
    level: "Menengah",
    icon: <Bug size={28} />,
    thumbnail: "/materi/malware.jpg",
    accentColor: "rgba(248,113,113,0.7)",
    title: "Malware",
    desc: "Program berbahaya yang dirancang untuk merusak, mencuri, atau mendapatkan akses ilegal ke sistem dan perangkat korban.",
  },
  {
    id: "wifi-attack",
    level: "Menengah",
    icon: <Wifi size={28} />,
    thumbnail: "/materi/wifi-attack.jpg",
    accentColor: "rgba(52,211,153,0.7)",
    title: "WiFi Attack",
    desc: "Serangan pada jaringan wireless untuk membobol, menyadap, atau mengalihkan koneksi pengguna di jaringan publik maupun privat.",
  },
  {
    id: "mobile-banking",
    level: "Menengah",
    icon: <Smartphone size={28} />,
    thumbnail: "/materi/mobile-banking.jpg",
    accentColor: "rgba(167,139,250,0.7)",
    title: "Mobile Banking Attack",
    desc: "Serangan yang menargetkan aplikasi perbankan mobile untuk mencuri dana dan data finansial nasabah secara diam-diam.",
  },
  {
    id: "data-breach",
    level: "Menengah",
    icon: <Database size={28} />,
    thumbnail: "/materi/data-breach.jpg",
    accentColor: "rgba(74,222,128,0.7)",
    title: "Data Breach",
    desc: "Kebocoran data pengguna akibat serangan siber, kesalahan konfigurasi sistem, atau tindakan orang dalam yang merugikan.",
  },
  {
    id: "account-takeover",
    level: "Menengah",
    icon: <Key size={28} />,
    thumbnail: "/materi/account-takeover.jpg",
    accentColor: "rgba(232,121,249,0.7)",
    title: "Account Takeover",
    desc: "Pengambilalihan akun digital korban melalui berbagai teknik pencurian sesi, identitas, dan kredensial yang sudah bocor.",
  },
  {
    id: "qr-code-attack",
    level: "Menengah",
    icon: <Crosshair size={28} />,
    thumbnail: "/materi/qr-code-attack.jpg",
    accentColor: "rgba(30, 51, 77, 0.7)",
    title: "QR Code Attack",
    desc: "Eksploitasi kode QR untuk mengarahkan korban ke situs phishing, mengunduh malware, atau mengalihkan pembayaran QRIS ke rekening penipu.",
  },
  {
    id: "web-attack",
    level: "Lanjut",
    icon: <Globe size={28} />,
    thumbnail: "/materi/web-attack.jpg",
    accentColor: "rgba(251,146,60,0.7)",
    title: "Web Attack",
    desc: "Serangan yang menargetkan aplikasi dan situs web untuk mencuri data, memanipulasi sistem, atau mengambil alih server secara penuh.",
  },
  {
    id: "network-attack",
    level: "Lanjut",
    icon: <Network size={28} />,
    thumbnail: "/materi/network-attack.jpg",
    accentColor: "rgba(56,189,248,0.7)",
    title: "Network Attack",
    desc: "Serangan pada infrastruktur jaringan untuk menyadap, memanipulasi, atau memutus komunikasi antara dua atau lebih pihak.",
  },
  {
    id: "ddos",
    level: "Lanjut",
    icon: <Siren size={28} />,
    thumbnail: "/materi/ddos.jpg",
    accentColor: "rgba(252,165,165,0.7)",
    title: "DDoS / DoS Attack",
    desc: "Server atau layanan dibanjiri traffic secara masif hingga tidak dapat melayani pengguna normal dan infrastruktur menjadi lumpuh.",
  },
  {
    id: "ai-attack",
    level: "Lanjut",
    icon: <Brain size={28} />,
    thumbnail: "/materi/ai-attack.jpg",
    accentColor: "rgba(165,180,252,0.7)",
    title: "AI Cyber Attack",
    desc: "Serangan siber yang memanfaatkan kecerdasan buatan untuk menciptakan penipuan, deepfake, dan serangan yang jauh lebih sulit dideteksi.",
  },
  {
    id: "advanced-attacks",
    level: "Lanjut",
    icon: <Crosshair size={28} />,
    thumbnail: "/materi/advanced-attacks.jpg",
    accentColor: "rgba(203,213,225,0.7)",
    title: "Advanced Attacks",
    desc: "Serangan tingkat lanjut yang digunakan aktor negara dan kelompok peretas profesional untuk menarget infrastruktur kritis.",
  },
];

const subTopicsData: Record<string, string[]> = {
  "phishing":           ["Email Phishing", "WhatsApp Phishing", "Smishing & Vishing", "QR Phishing (Quishing)", "Fake Login Page", "Spear Phishing", "Clone Phishing"],
  "social-engineering": ["Impersonation", "Baiting", "Scareware", "Pretexting", "Shoulder Surfing & Dumpster Diving", "Tailgating & Piggybacking"],
  "password-attack":    ["Dictionary Attack", "Brute Force Attack", "Password Spraying", "Credential Stuffing", "Rainbow Table Attack", "Keylogging"],
  "scam-online":        ["Marketplace Scam", "Giveaway & Hadiah Palsu", "Job Scam (Lowongan Palsu)", "Investment & Crypto Scam", "Romance Scam"],
  "ecommerce-fraud":    ["Fake Marketplace & Toko Online Palsu", "Payment Fraud & Carding", "Account Takeover E-Commerce", "Triangulation Fraud", "Refund & Return Fraud", "Friendly Fraud"],
  "malware":            ["Virus & Worm", "Trojan Horse", "Adware & Spyware", "Ransomware", "Keylogger", "Rootkit", "Botnet Malware", "Malware APK Android"],
  "wifi-attack":        ["WiFi Password Cracking", "Evil Twin Attack", "Deauthentication Attack", "Rogue Access Point", "WPS Cracking"],
  "mobile-banking":     ["Fake Banking App", "OTP Theft", "SIM Swapping", "Overlay Attack", "Banking Trojan & Accessibility Abuse"],
  "data-breach":        ["Credential Leak", "Identity Leak (NIK, KTP)", "Cloud Data Leak", "Financial Data Leak", "Insider Threat & Dark Web Monitoring"],
  "account-takeover":   ["WhatsApp Hijacking", "Email Takeover", "Session Theft (Cookie Stealing)", "SIM Swapping", "Credential Stuffing Massal"],
  "web-attack":         ["SQL Injection", "Cross-Site Scripting (XSS)", "Clickjacking", "CSRF Attack", "Directory Traversal", "File Inclusion (LFI/RFI)", "Remote Code Execution (RCE)", "SSRF Attack"],
  "network-attack":     ["Packet Sniffing", "IP Spoofing", "ARP Spoofing", "DNS Spoofing", "Man-in-the-Middle (MITM)", "Session Hijacking"],
  "ddos":               ["Ping Flood & UDP Flood", "HTTP Flood", "SYN Flood", "Slowloris Attack", "Botnet DDoS"],
  "ai-attack":          ["AI Phishing & AI Chat Scam", "Voice Cloning", "Deepfake Video", "AI-Powered APT"],
  "advanced-attacks":   ["Ransomware Enterprise", "Zero-Day Exploit", "APT & Cyber Espionage", "Supply Chain Attack", "DDoS Infrastruktur Kritis"],
  "qr-code-attack":     ["QR Phishing (Quishing)", "QRIS Palsu", "QR Redirect Attack", "Fake Payment QR", "QR Malware Download"],
};

// ─── MateriCard ───────────────────────────────────────────────────────────────
function MateriCard({ materi }: { materi: Materi }) {
  const [expanded, setExpanded] = useState(false);
  const subs = subTopicsData[materi.id] ?? [];

  return (
    <div className="group bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-white/[0.08] rounded-[2rem] overflow-hidden transition-all duration-500 hover:border-blue-500/50 hover:shadow-[0_30px_60px_-15px_rgba(59,130,246,0.2)] flex flex-col">
      
      {/* ── THUMBNAIL (Cyber Style) ── */}
      <div className="relative h-56 overflow-hidden bg-slate-900">
        <img
          src={materi.thumbnail}
          alt={materi.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c1322] via-[#0c1322]/40 to-transparent" />
        
        {/* Floating Badges */}
        <div className="absolute top-5 left-5 right-5 flex justify-between items-start">
          <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[9px] font-black uppercase tracking-[2px] text-white">
            {materi.level}
          </span>
          <div className="p-2 rounded-xl bg-blue-600/90 backdrop-blur-sm border border-blue-400/30 text-white shadow-lg">
            {materi.icon}
          </div>
        </div>

        <div className="absolute bottom-5 left-6">
          <h3 className="text-white font-black text-2xl uppercase tracking-tighter mb-1">
            {materi.title}
          </h3>
          <div className="flex items-center gap-2 text-blue-400 text-[10px] font-bold uppercase tracking-widest">
            <BookOpen size={12} /> {subs.length} Modul Terenkripsi
          </div>
        </div>
      </div>

      {/* ── CARD BODY ── */}
      <div className="p-7 flex-1 flex flex-col">
        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-8 line-clamp-2">
          {materi.desc}
        </p>

        <div className="mt-auto flex items-center justify-between">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-blue-500 transition-colors uppercase tracking-[2px]"
          >
            <div className={`p-1.5 rounded-lg transition-all ${expanded ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-slate-100 dark:bg-white/5'}`}>
               {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </div>
            {expanded ? "Hide Modul" : "Show Modul"}
          </button>
          
          <Link
            href={`/pembelajaran/${materi.id}`}
            className="px-7 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[11px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 dark:hover:text-white transition-all shadow-xl active:scale-95 flex items-center gap-2"
          >
            Pelajari <ChevronRight size={14} strokeWidth={3} />
          </Link>
        </div>
      </div>

      {/* ── SUB-TOPICS (Gaya Terminal) ── */}
      {expanded && (
        <div className="px-7 pb-7 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-black/30 border border-slate-100 dark:border-white/5 font-mono">
            {subs.map((sub, i) => (
              <Link 
                key={i} 
                href={`/pembelajaran/${materi.id}/${sub.toLowerCase().replace(/\s+/g, '-')}`}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-white dark:hover:bg-white/5 group/sub transition-all border border-transparent hover:border-blue-500/20"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-blue-500/50 tracking-tighter">[{i < 9 ? `0${i+1}` : i+1}]</span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 group-hover/sub:text-blue-500">{sub}</span>
                </div>
                <ChevronRight size={12} className="text-slate-300 opacity-0 group-hover/sub:opacity-100 -translate-x-2 group-hover/sub:translate-x-0 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PembelajaranPage() {
  const [activeLevel, setActiveLevel] = useState<"Semua" | "Dasar" | "Menengah" | "Lanjut">("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = allMateri.filter(m => {
    const matchLevel  = activeLevel === "Semua" || m.level === activeLevel;
    const matchSearch = searchQuery === "" ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchLevel && matchSearch;
  });

  const col0 = filtered.filter((_, i) => i % 2 === 0);
  const col1 = filtered.filter((_, i) => i % 2 === 1);

  const countFor = (l: string) =>
    l === "Semua" ? allMateri.length : allMateri.filter(m => m.level === l).length;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white font-sans overflow-x-hidden transition-colors duration-500">
      <Navbar />

      {/* ── HERO ── */}
<section className="relative min-h-[420px] flex items-center overflow-hidden border-b border-slate-200 dark:border-white/[0.06]">
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
              onClick={() => document.getElementById("modul")?.scrollIntoView({ behavior: "smooth" })}
className="flex items-center gap-3 bg-blue-600/80 backdrop-blur-sm border border-blue-400/30 text-white font-black text-sm uppercase tracking-[3px] px-6 py-3 rounded-2xl transition-all hover:bg-blue-600 shadow-xl active:scale-95 w-fit"
            >
              Mulai Belajar <ChevronRight size={16} strokeWidth={3} />
            </button>
          </div>
        </div>
      </section>

      {/* ── MAIN ── */}
      <div id="modul" className="w-full max-w-[1600px] mx-auto px-8 md:px-16 xl:px-20 py-12 flex gap-7 items-start">

        {/* Sidebar */}
        <aside className="w-48 xl:w-56 shrink-0 sticky top-6 space-y-3">
          <div className="relative">
            <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari materi..."
           className="w-full bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-white/[0.08] rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 outline-none focus:border-blue-500 dark:focus:border-white/20 transition-colors shadow-sm"
            />
          </div>

      <div className="bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-4 shadow-sm transition-colors duration-500">
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-[3px] mb-3 flex items-center gap-1.5">
              <BarChart2 size={10} /> Tingkatan
            </p>
            <div className="space-y-0.5">
              {(["Semua", "Dasar", "Menengah", "Lanjut"] as const).map((lvl) => {
                const isActive = activeLevel === lvl;
                return (
                  <button key={lvl} onClick={() => setActiveLevel(lvl)}
  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-bold transition-all duration-300 ${
    isActive 
      ? "bg-blue-600 text-white shadow-md border border-blue-500" 
      : "text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent"
  }`}>
  <div className="flex items-center gap-2">
    <span className={`w-1.5 h-1.5 rounded-full transition-colors ${isActive ? "bg-white" : "bg-slate-700"}`} />
    {lvl}
  </div>
  <span className={`text-[11px] font-bold ${isActive ? "text-white dark:text-slate-400" : "text-slate-500 dark:text-slate-700"}`}>{countFor(lvl)}</span>
</button>
                );
              })}
            </div>
          </div>

             <div className="bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-4 space-y-3 shadow-sm">
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-[3px] flex items-center gap-1.5">
              <BookOpen size={10} /> Panduan Level
            </p>
            {[
              { level: "Dasar",    desc: "Untuk pemula, tidak perlu latar teknis." },
              { level: "Menengah", desc: "Sudah paham risiko digital dasar." },
              { level: "Lanjut",   desc: "Untuk profesional & pelaku IT." },
            ].map(g => (
              <div key={g.level}>
                <p className="text-[10px] font-black uppercase tracking-wider mb-0.5 flex items-center gap-1.5 text-slate-300">
                  <span className="w-1 h-1 rounded-full bg-slate-400" /> {g.level}
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed">{g.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={12} className="text-slate-500" />
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">AI Verified</p>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Semua materi diverifikasi berdasarkan kasus nyata di Indonesia 2025.
            </p>
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1 min-w-0">
          <div className="mb-7">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[4px] mb-1">Modul Pembelajaran</p>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {activeLevel === "Semua" ? "SEMUA MATERI" : `LEVEL ${activeLevel.toUpperCase()}`}
              <span className="ml-3 text-sm font-semibold text-slate-600 normal-case tracking-normal">{filtered.length} materi</span>
            </h2>
          </div>

          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
              <div className="flex flex-col gap-4">
                {col0.map(m => <MateriCard key={m.id} materi={m} />)}
              </div>
              <div className="flex flex-col gap-4">
                {col1.map(m => <MateriCard key={m.id} materi={m} />)}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Search size={32} className="text-slate-700 mb-4" />
              <p className="text-slate-400 font-bold text-lg mb-1">Materi tidak ditemukan</p>
              <p className="text-slate-600 text-sm mb-4">Coba kata kunci lain atau reset filter</p>
              <button onClick={() => { setSearchQuery(""); setActiveLevel("Semua"); }}
                className="text-sm text-slate-300 hover:text-white font-semibold underline underline-offset-4">
                Reset filter
              </button>
            </div>
          )}

          <div className="mt-8 flex items-start gap-3 p-6 rounded-2xl bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] shadow-inner">
            <AlertTriangle size={13} className="text-slate-500 mt-0.5 shrink-0" />
            <p className="text-[12px] text-slate-500 leading-relaxed">
              <span className="text-slate-300 font-bold">Catatan: </span>
              Seluruh materi dirancang berdasarkan kasus nyata di Indonesia. Setiap sub-topik dilengkapi contoh konkret dan langkah perlindungan yang langsung bisa diterapkan.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}