  "use client";

  import Navbar from "@/components/Navbar";
  import { 
    BookOpen, 
    MessageCircle, 
    ShieldCheck, 
    ArrowRight, 
    ShieldAlert,
    Terminal,
    Search,
    Brain,
    Lock,
    Zap,
    Globe,
  } from "lucide-react";
  import Link from "next/link";

  export default function Home() {
    const fiturUtama = [
      { 
        title: "Edukasi Interaktif", 
        cat: "LEARNING", 
        desc: "Akses berbagai materi keamanan siber mulai dari Phishing hingga Malware dengan penjelasan yang mudah dipahami.", 
        icon: <BookOpen size={28} />, 
        link: "/pembelajaran",
        color: "text-blue-400",
        border: "hover:border-blue-500/50",
        glow: "hover:shadow-[0_0_40px_rgba(59,130,246,0.12)]",
        badge: "bg-blue-500/10 border-blue-500/20",
      },
      { 
        title: "Chatbot AI 24/7", 
        cat: "ASSISTANT", 
        desc: "Konsultasikan keraguan Anda mengenai ancaman digital kepada asisten cerdas berbasis AI kapan saja.", 
        icon: <MessageCircle size={28} />, 
        link: "/chatbot",
        color: "text-violet-400",
        border: "hover:border-violet-500/50",
        glow: "hover:shadow-[0_0_40px_rgba(139,92,246,0.12)]",
        badge: "bg-violet-500/10 border-violet-500/20",
      },
      { 
        title: "Verifikasi Ancaman", 
        cat: "SECURITY TOOL", 
        desc: "Mesin deteksi URL berbahaya yang memberikan skor risiko instan untuk melindungi privasi data Anda.", 
        icon: <ShieldAlert size={28} />, 
        link: "/verifikasi",
        color: "text-cyan-400",
        border: "hover:border-cyan-500/50",
        glow: "hover:shadow-[0_0_40px_rgba(34,211,238,0.12)]",
        badge: "bg-cyan-500/10 border-cyan-500/20",
      }
    ];

    const caraKerja = [
      {
        step: "01",
        title: "Pelajari Ancaman",
        desc: "Mulai dengan memahami jenis-jenis ancaman siber seperti phishing, malware, dan social engineering melalui modul edukasi interaktif berbasis kasus nyata.",
        icon: <Brain size={24} />,
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
      },
      {
        step: "02",
        title: "Verifikasi Link & URL",
        desc: "Masukkan URL mencurigakan ke mesin deteksi kami. Sistem menganalisis menggunakan Google Safe Browsing API dan heuristik cerdas untuk menghasilkan skor risiko.",
        icon: <Search size={24} />,
        color: "text-cyan-400",
        bg: "bg-cyan-500/10",
        border: "border-cyan-500/20",
      },
      {
        step: "03",
        title: "Konsultasi dengan AI",
        desc: "Gunakan chatbot berbasis RAG (Retrieval-Augmented Generation) untuk bertanya langsung tentang ancaman yang Anda temui dan dapatkan jawaban yang akurat.",
        icon: <MessageCircle size={24} />,
        color: "text-violet-400",
        bg: "bg-violet-500/10",
        border: "border-violet-500/20",
      },
    ];

    const keunggulan = [
      {
        icon: <Lock size={20} />,
        title: "Enkripsi Password",
        desc: "Password pengguna dienkripsi menggunakan algoritma Bcrypt sebelum disimpan ke database.",
        color: "text-blue-400",
        bg: "bg-blue-500/10",
      },
      {
        icon: <Brain size={20} />,
        title: "RAG-Based AI Chatbot",
        desc: "Chatbot menjawab berdasarkan dokumen referensi keamanan siber, bukan generasi teks sembarangan.",
        color: "text-violet-400",
        bg: "bg-violet-500/10",
      },
      {
        icon: <Search size={20} />,
        title: "Deteksi URL Hybrid",
        desc: "Mengombinasikan Google Safe Browsing API dan analisis heuristik untuk akurasi deteksi maksimal.",
        color: "text-cyan-400",
        bg: "bg-cyan-500/10",
      },
      {
        icon: <Globe size={20} />,
        title: "Autentikasi JWT",
        desc: "Setiap sesi pengguna diamankan menggunakan JSON Web Token (JWT) yang terverifikasi.",
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
      },
    ];

    return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white font-sans overflow-x-hidden selection:bg-blue-500/30 transition-colors duration-500">
        <Navbar />

  {/* ===== 1. HERO (ROBOT AI STYLE) ===== */}
       <section className="relative min-h-[90vh] flex items-center pt-32 pb-20 overflow-hidden border-b border-slate-200 dark:border-white/5">
          
          {/* BACKGROUND DECORATION */}
          <div className="absolute inset-0 pointer-events-none">
        <div
  className="absolute inset-0 opacity-[0.1] dark:opacity-[0.03]"
  style={{
    backgroundImage:
      "linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)",
    backgroundSize: "60px 60px",
  }}
/>
            <div className="absolute top-[-15%] left-[-10%] w-[55%] h-[70%] bg-blue-600/10 rounded-full blur-[130px]" />
          </div>

          <div className="max-w-[1440px] mx-auto relative z-10 w-full px-8 md:px-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* SISI KIRI: TEKS & CTA */}
          <div className="flex flex-col items-start text-left order-2 lg:order-1 -mt-24">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-5 py-2 mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[3px]">AI-Powered Platform</span>
              </div>

       <h1 className="text-4xl md:text-5xl lg:text-6xl font-[1000] leading-[1.1] tracking-tighter uppercase mb-1">
     <span className="block text-slate-900 dark:text-white mb-2">LITERASI</span>
      <span className="block text-blue-600 dark:text-blue-500 drop-shadow-sm dark:drop-shadow-[0_0_20px_rgba(59,130,246,0.4)]">KEAMANAN SIBER</span>
     <span className="block text-slate-900 dark:text-white mt-2">UNTUK SEMUA</span>
      </h1>
<p className="text-sm md:text-base text-slate-600 dark:text-gray-400 max-w-md leading-relaxed font-sans mb-6">
  Platform cerdas berbasis AI untuk membedah ancaman{" "}
  <span className="text-blue-400 font-bold">Phishing</span> dan membangun sistem 
  pertahanan <span className="text-slate-900 dark:text-white font-bold">Kesadaran Digital</span> masyarakat Indonesia.
</p>
             <Link
  href="/pembelajaran"
  className="w-fit group bg-blue-600 text-white px-7 py-4 rounded-xl font-black text-base transition-all hover:bg-blue-700 hover:shadow-xl hover:-translate-y-1 flex items-center gap-3 uppercase tracking-wider"
>
  Mulai Belajar
  <ArrowRight size={20} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
</Link>
            </div>

  {/* SISI KANAN: VISUAL ROBOT PRO */}
<div className="hidden lg:relative lg:flex items-center justify-center lg:order-2 transition-all duration-700 lg:-mt-30">   
    {/* Aura Glow Adaptif */}
{/* Ring Luar dengan Efek Masking & Dashed */}
 <div className="absolute w-[360px] h-[360px] md:w-[420px] md:h-[420px] rounded-full border border-dashed border-blue-500/10 dark:border-blue-400/10 animate-spin-slow [mask-image:linear-gradient(to_right,transparent,black_40%)]" />

{/* Ring Tambahan yang lebih kecil (Optional untuk kedalaman) */}
<div className="absolute w-[400px] h-[400px] md:w-[480px] md:h-[480px] rounded-full border border-dotted border-blue-400/10 dark:border-white/5 animate-spin-reverse-slow [mask-image:linear-gradient(to_right,transparent,black_50%)]" />

    {/* HUD Rings Adaptif */}
<div className="absolute w-[380px] h-[380px] md:w-[520px] md:h-[520px] rounded-full border border-blue-200/30 dark:border-blue-500/20 animate-spin-slow" />
<div className="absolute w-[310px] h-[310px] md:w-[420px] md:h-[420px] rounded-full border border-blue-400/10 dark:border-blue-400/50 dark:shadow-[0_0_30px_rgba(59,130,246,0.4)]" /> 

    {/* Container Robot */}
   
<div className="relative z-10 w-[260px] h-[260px] md:w-[380px] md:h-[380px] rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl">
    <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-white/10 pointer-events-none z-20 opacity-100 dark:opacity-40" />
  <img 
    src="/robot-ai.png" 
    alt="Cyber Robot AI"
    className="w-full h-full object-cover object-[center_15%] scale-105" 
  />
</div>
<div className="absolute w-[500px] h-[500px] rounded-full border border-blue-100 dark:border-blue-900/20 pointer-events-none" />
<div className="absolute w-[580px] h-[500px] rounded-full border border-slate-100 dark:border-slate-800/20 -rotate-12 pointer-events-none" />

  
    {/* 4. Floating Tech Labels (Aksen 'Mahal') */}
    <div className="absolute -top-4 -right-4 z-30 hidden md:block animate-bounce [animation-duration:4s]">
   <div className="bg-white/90 dark:bg-blue-600/10 backdrop-blur-md border border-slate-200 dark:border-blue-500/30 p-4 rounded-2xl shadow-xl transition-all">
  <div className="text-[10px] font-[1000] text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">AI Status</div>
  <div className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tighter">ANALYZING_THREATS...</div>
</div>
    </div>

  <div className="absolute -bottom-10 -left-10 z-30 hidden md:block animate-bounce [animation-duration:3s]">
  <div className="bg-white dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 p-4 rounded-2xl flex items-center gap-4 shadow-xl dark:shadow-none transition-all">
        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
          <ShieldCheck size={18} />
        </div>
        <div>
          <div className="text-[9px] font-black text-gray-400 uppercase">System Integrity</div>
          <div className="text-[11px] font-bold text-slate-900 dark:text-white uppercase">Encrypted 100%</div>
        </div>
      </div>
    </div>
  </div>
  </div>
        </section>

  {/* ===== 2. FITUR PLATFORM ===== */}
  <section className="py-32 px-6 md:px-12 max-w-7xl mx-auto">
  <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
  <div className="max-w-2xl">
    <div className="flex items-center gap-2 mb-4 text-blue-400 font-black text-[10px] tracking-[4px] uppercase">
      <Terminal size={12} /> Core Capabilities
    </div>
     <h2 className="text-5xl md:text-6xl font-[1000] text-slate-900 dark:text-white tracking-tight leading-none mb-5 uppercase">
      Fitur Platform
    </h2>
    <p className="text-slate-600 dark:text-gray-300 font-medium leading-relaxed">
  CyberGuard menyediakan tiga pilar utama untuk membantu pengguna memahami dan menghadapi ancaman siber secara mandiri.
</p>
  </div>
  <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent mb-3 hidden md:block" />
  </div>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {fiturUtama.map((item, i) => (
    <Link
      key={i}
      href={item.link}
      className={`group relative bg-white dark:bg-white/[0.05] p-10 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-2xl dark:shadow-none transition-all duration-500 flex flex-col h-full overflow-hidden`}
    >
      <div className={`inline-flex w-14 h-14 rounded-2xl ${item.badge} border items-center justify-center mb-8 transition-transform group-hover:scale-110 duration-300 ${item.color}`}>
        {item.icon}
      </div>
      <span className={`text-[10px] font-black uppercase tracking-[3px] mb-2 ${item.color}`}>{item.cat}</span>
      <h3 className="font-black text-xl mb-4 text-white tracking-tight uppercase leading-tight">{item.title}</h3>
      <p className="text-slate-600 dark:text-gray-300 leading-relaxed text-sm flex-1 font-medium">{item.desc}</p>
    </Link>
  ))}
  </div>
  </section>

  {/* ===== 3. CARA KERJA ===== */}
  <section className="py-32 px-6 md:px-12 border-t border-slate-200 dark:border-white/10 transition-colors">
  <div className="max-w-7xl mx-auto">
  <div className="text-center mb-20">
    <div className="flex items-center justify-center gap-2 mb-4 text-cyan-400 font-black text-[10px] tracking-[4px] uppercase">
      <Zap size={12} /> Alur Penggunaan
    </div>
     <h2 className="text-5xl md:text-6xl font-[1000] text-slate-900 dark:text-white tracking-tight leading-none mb-5 uppercase">
    Cara Kerja <span className="text-blue-600 dark:text-blue-500">CyberGuard</span>
    </h2>
   <p className="text-slate-600 dark:text-gray-300 font-medium max-w-2xl mx-auto leading-relaxed">
  Tiga langkah sederhana untuk meningkatkan kesadaran keamanan digital Anda menggunakan platform ini.
</p>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
    <div className="hidden md:block absolute top-16 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px bg-gradient-to-r from-blue-500/30 via-cyan-500/30 to-violet-500/30" />

    {caraKerja.map((item, i) => (
   <div key={i} className="relative flex flex-col items-center text-center p-8 rounded-3xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-xl">
        <div className={`relative w-14 h-14 rounded-2xl ${item.bg} border ${item.border} flex items-center justify-center mb-6 ${item.color}`}>
          {item.icon}
         <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-blue-600 dark:bg-[#020617] border border-blue-400 dark:border-white/20 text-[9px] font-black text-white flex items-center justify-center shadow-lg">
  {item.step}
</span>
        </div>
        <h3 className={`font-black text-lg mb-3 uppercase tracking-tight ${item.color}`}>{item.title}</h3>
        <p className="text-gray-300 text-sm leading-relaxed">{item.desc}</p>
      </div>
    ))}
  </div>
  </div>
  </section>

  {/* ===== 4. KEUNGGULAN TEKNIS ===== */}
  <section className="py-32 px-6 md:px-12 border-t border-slate-200 dark:border-white/10">
  <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
  <div>
   <div className="flex items-center gap-2 mb-5 text-blue-600 dark:text-blue-400 font-black text-[10px] tracking-[4px] uppercase">
      <ShieldCheck size={12} /> Mengapa CyberGuard
    </div>
    <h2 className="text-5xl md:text-4xl md:text-5xl font-[1000] text-slate-900 dark:text-white tracking-tighter leading-tight uppercase mb-6">
      Dibangun dengan <br />
      <span className="text-blue-600 dark:text-blue-500">Standar Keamanan</span> <br />
      yang Tepat.
    </h2>
<p className="text-slate-600 dark:text-gray-300 leading-relaxed font-medium">
      Setiap komponen CyberGuard dirancang menggunakan teknologi dan praktik keamanan yang dapat dipertanggungjawabkan secara teknis.
    </p>
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
    {keunggulan.map((item, i) => (
      <div
        key={i}
        className="p-7 rounded-2xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none hover:border-blue-500/50 dark:hover:border-white/30 transition-all duration-300"
      >
        <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center ${item.color} mb-5`}>
          {item.icon}
        </div>
        <h4 className="font-black text-slate-900 dark:text-white text-sm mb-2 uppercase tracking-tight">{item.title}</h4>
        <p className="text-slate-600 dark:text-gray-300 text-xs leading-relaxed font-medium">{item.desc}</p>
      </div>
    ))}
  </div>
  </div>
  </section>

<footer className="py-20 text-center text-slate-500 dark:text-gray-400 font-black text-[10px] uppercase tracking-[12px] border-t border-slate-200 dark:border-white/10 transition-colors">
  © 2026 CYBERGUARD <span className="text-blue-600 dark:text-blue-500">INTELLIGENCE</span>
</footer>
    </main>
      );
  }
