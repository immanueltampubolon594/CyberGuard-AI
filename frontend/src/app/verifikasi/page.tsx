"use client";

import Navbar from "@/components/Navbar";
import { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  ShieldCheck, 
  Search, 
  AlertCircle, 
  Loader2,
  Info,
  ShieldX,
  Lock,
  ArrowRight,
  Activity,
  Cpu,
  Terminal,
  HelpCircle,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Globe,
  FileText,
  ThumbsUp,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

export default function VerifikasiHalaman() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [analyzedUrl, setAnalyzedUrl] = useState("");
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [animatedScore, setAnimatedScore] = useState(0);
  
  const [result, setResult] = useState<{
    score: number;
    level: string;
    reasons: string[];
    summary?: string;
    recommendation?: string;
    is_valid_url?: boolean;
  } | null>(null);

  // Smooth animation dengan easing (dari File 1)
  useEffect(() => {
    if (result && result.score !== animatedScore) {
      const duration = 2000;
      const startTime = performance.now();
      const startValue = 0;
      const endValue = result.score;
      
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
      
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutCubic(progress);
        const currentValue = Math.floor(startValue + (endValue - startValue) * easedProgress);
        
        setAnimatedScore(currentValue);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [result]);

  const handleVerify = async () => {
    if (!url) return;
    
    let formattedUrl = url;
    if (!url.startsWith("http")) {
      formattedUrl = "https://" + url;
    }

    setLoading(true);
    setResult(null);
    setAnimatedScore(0);
    setAnalyzedUrl(formattedUrl);
    setScreenshot(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/verify-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: formattedUrl }), 
      });

      if (!response.ok) throw new Error("Gagal terhubung ke backend");

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.risk?.reasons?.[0] || "Analisis gagal");
      }

      const risk = data.risk;
      
      if (risk.screenshot) {
        setScreenshot(risk.screenshot);
      }

      const reasons = Array.isArray(risk.reasons) ? risk.reasons : [];
      
      setTimeout(() => {
        setResult({
          score: risk.score ?? 0,
          level: risk.level ?? "SAFE",
          reasons: reasons,
          summary: risk.summary ?? "",
          recommendation: risk.recommendation ?? "",
          is_valid_url: risk.is_valid_url ?? true
        });
        setLoading(false);
      }, 500);

    } catch (error: any) {
      console.error("❌ Error:", error);
      alert(error.message || "Sistem Offline: Pastikan server backend Anda aktif!");
      setLoading(false);
    }
  };

  const openUrlSafely = () => {
    window.open(analyzedUrl, '_blank', 'noopener,noreferrer');
  };

  const resetAnalysis = () => {
    setResult(null);
    setUrl("");
    setScreenshot(null);
    setAnimatedScore(0);
  };

  // Color configuration (dari File 1, disesuaikan dengan theme File 2)
  const getScoreConfig = (score: number) => {
    if (score >= 75) return { 
      stroke: "#ef4444", 
      text: "text-red-500",
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      status: "BERBAHAYA",
      icon: ShieldX,
      message: "Link ini berbahaya! Jangan kunjungi."
    };
    if (score >= 40) return { 
      stroke: "#f97316", 
      text: "text-orange-500",
      bg: "bg-orange-500/10",
      border: "border-orange-500/30",
      status: "MENCURIGAKAN",
      icon: ShieldAlert,
      message: "Link ini mencurigakan. Hati-hati!"
    };
    if (score >= 25) return { 
      stroke: "#eab308", 
      text: "text-yellow-500",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/30",
      status: "WASPADA",
      icon: AlertTriangle,
      message: "Perlu kewaspadaan."
    };
    return { 
      stroke: "#22c55e", 
      text: "text-green-500",
      bg: "bg-green-500/10",
      border: "border-green-500/30",
      status: "AMAN",
      icon: ShieldCheck,
      message: "Link ini aman untuk dikunjungi."
    };
  };

  const scoreConfig = result ? getScoreConfig(result.score) : null;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white font-sans overflow-x-hidden selection:bg-blue-500/30 transition-colors duration-500">
      <Navbar />

      {/* HERO SECTION - Dari File 2 */}
      <section className="relative pt-12 pb-16 px-12 overflow-hidden border-b border-white/5 text-center">
        <div className="absolute inset-0 pointer-events-none">
           <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[70%] bg-blue-600/10 rounded-full blur-[120px]"></div>
           <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[50%] bg-indigo-600/5 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-5xl mx-auto relative z-10 animate-in fade-in slide-in-from-top-8 duration-1000">
          <div className="inline-flex items-center gap-3 bg-slate-100 dark:bg-white/5 backdrop-blur-md px-6 py-2 rounded-xl border border-slate-200 dark:border-white/10 shadow-lg mb-8 transition-colors">
            <Cpu size={16} className="text-blue-600 dark:text-blue-500" />
            <span className="text-[10px] font-[1000] uppercase tracking-[4px] text-slate-500 dark:text-gray-400">Neural Link Verification System</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-[1000] tracking-[2px] uppercase mb-8 leading-[0.9]">
            <span className="text-slate-900 dark:text-white">Verifikasi </span><span className="text-blue-600">Ancaman</span><br />
            <span className="text-blue-600">URL </span><span className="text-slate-900 dark:text-white">Real-Time</span>
          </h1>

          <p className="text-xl text-slate-600 dark:text-gray-200 max-w-3xl mx-auto leading-relaxed font-semibold">
            Gunakan mesin deteksi berbasis AI untuk membedah anatomi link mencurigakan dan mendapatkan laporan risiko instan sebelum melakukan interaksi.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-12 -mt-4 relative z-20 pb-40">  
        
        {/* INPUT SECTION - Dari File 2 */}
        <div className="bg-white dark:bg-[#0f172a]/30 p-5 md:p-6 rounded-[30px] border border-slate-200 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_0_50px_rgba(0,0,0,0.3)] backdrop-blur-xl">
          <div className="relative group">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500 opacity-50 group-focus-within:opacity-100 transition-opacity">
               <Terminal size={24} />
            </div>
           <input 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
              type="text" 
              placeholder="MASUKKAN URL UNTUK DIANALISIS..." 
              className="w-full bg-white dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-[20px] pl-14 pr-36 py-4 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:bg-slate-50 dark:focus:bg-white/10 transition-all text-sm font-black text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-white/10 shadow-xl dark:shadow-inner tracking-tight"
            />
            <button 
              onClick={handleVerify}
              disabled={loading || !url}
              className="absolute right-2 top-2 bottom-2 px-8 bg-blue-600 text-white rounded-[16px] font-[1000] uppercase tracking-widest text-xs hover:bg-blue-500 transition-all flex items-center gap-3 disabled:opacity-20 shadow-lg shadow-blue-500/20 active:scale-95"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} strokeWidth={3} />}
              Mulai Analisis
            </button>
          </div>
        </div>

        {/* RESULT SECTION - Dari File 1, disesuaikan dengan theme File 2 */}
        {result && scoreConfig && (
          <div className="mt-12 animate-in fade-in zoom-in duration-700">
            <div className="grid md:grid-cols-3 gap-6">
              
              {/* LEFT: SCORE CIRCLE - Dari File 1 */}
              <div className="md:col-span-1">
                <div className={`rounded-3xl border-2 ${scoreConfig.border} ${scoreConfig.bg} p-8 text-center shadow-2xl`}>
                  {/* Circular Progress */}
                  <div className="relative w-48 h-48 mx-auto mb-6">
                    <svg className="w-full h-full transform -rotate-90">
                      {/* Background circle */}
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        className="text-white/5"
                      />
                      {/* Progress circle with smooth animation */}
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke={scoreConfig.stroke}
                        strokeWidth="12"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 88}`}
                        strokeDashoffset={`${2 * Math.PI * 88 * (1 - animatedScore / 100)}`}
                        className="transition-all duration-300"
                        style={{
                          transition: 'stroke-dashoffset 0.3s ease-out'
                        }}
                      />
                    </svg>
                    
                    {/* Score text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-6xl font-black ${scoreConfig.text}`}>
                        {animatedScore}%
                      </span>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">
                        Risk Score
                      </span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${scoreConfig.bg} ${scoreConfig.text} border ${scoreConfig.border}`}>
                    <scoreConfig.icon size={18} />
                    <span className="font-bold text-sm">{scoreConfig.status}</span>
                  </div>
                  
                  <p className="text-xs text-gray-400 mt-3">
                    {scoreConfig.message}
                  </p>
                </div>
              </div>

              {/* RIGHT: DETAILS - Dari File 1 */}
              <div className="md:col-span-2 space-y-4">
                
                {/* URL Info */}
                <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-500 dark:text-gray-400">URL:</span>
                    <span className="text-slate-900 dark:text-white font-mono truncate">{analyzedUrl}</span>
                  </div>
                </div>
                
                {/* Screenshot - Dari File 1 */}
                {screenshot && (
                  <div className="rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden bg-black">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-white/5">
                      <ImageIcon size={16} className="text-blue-500" />
                      <span className="text-sm font-bold text-slate-900 dark:text-white">Preview Website</span>
                    </div>
                    <div className="relative">
                      <img 
                        src={screenshot} 
                        alt="Website preview" 
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          console.error("❌ Gagal load screenshot");
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Reasons - Dari File 1 */}
                <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Activity size={18} className="text-blue-500" />
                    <span className="font-bold text-slate-900 dark:text-white">Hasil Analisis</span>
                  </div>
                  
                  {result.reasons.length > 0 ? (
                    <div className="space-y-2">
                      {result.reasons.map((reason, i) => (
                        <div key={i} className="flex items-start gap-3 text-sm">
                          <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-600 dark:text-gray-300">{reason}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-gray-400 py-4">
                      <ThumbsUp size={16} />
                      <span>Tidak ada risiko yang terdeteksi</span>
                    </div>
                  )}
                </div>

                {/* Summary & Recommendation - Dari File 1 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText size={16} className="text-blue-500" />
                      <span className="font-bold text-sm text-slate-900 dark:text-white">Kesimpulan</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                      {result.summary || "URL ini tidak menunjukkan ancaman yang signifikan."}
                    </p>
                  </div>
                  
                  <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle size={16} className="text-green-500" />
                      <span className="font-bold text-sm text-slate-900 dark:text-white">Saran</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                      {result.recommendation || "URL ini tampak aman, namun tetap waspada."}
                    </p>
                  </div>
                </div>

                {/* ACTION BUTTONS - Dari File 1 */}
                <div className="flex gap-3 pt-2">
                  
                  {/* URL TIDAK VALID */}
                  {result.is_valid_url === false && (
                    <button 
                      onClick={resetAnalysis}
                      className="w-full bg-slate-600 hover:bg-slate-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                    >
                      <ArrowLeft size={18} />
                      Analisis Ulang
                    </button>
                  )}
                  
                  {/* AMAN (0-24%) */}
                  {result.is_valid_url !== false && result.score < 25 && (
                    <>
                      <button 
                        onClick={resetAnalysis}
                        className="flex-1 bg-slate-600 hover:bg-slate-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                      >
                        <ArrowLeft size={18} />
                        Analisis Ulang
                      </button>
                      <button 
                        onClick={openUrlSafely}
                        className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-500/20"
                      >
                        <Globe size={18} />
                        Kunjungi Website
                      </button>
                    </>
                  )}
                  
                  {/* WASPADA (25-39%) */}
                  {result.is_valid_url !== false && result.score >= 25 && result.score < 40 && (
                    <>
                      <button 
                        onClick={resetAnalysis}
                        className="flex-1 bg-slate-600 hover:bg-slate-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                      >
                        <ArrowLeft size={18} />
                        Analisis Ulang
                      </button>
                      <button 
                        onClick={openUrlSafely}
                        className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all border-2 border-yellow-400 shadow-lg shadow-yellow-500/20"
                      >
                        <AlertTriangle size={18} />
                        Tetap Buka (Risiko)
                      </button>
                    </>
                  )}
                  
                  {/* MENCURIGAKAN (40-74%) */}
                  {result.is_valid_url !== false && result.score >= 40 && result.score < 75 && (
                    <>
                      <button 
                        onClick={resetAnalysis}
                        className="flex-1 bg-slate-600 hover:bg-slate-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                      >
                        <ArrowLeft size={18} />
                        Analisis Ulang
                      </button>
                      <button 
                        onClick={openUrlSafely}
                        className="flex-1 bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all border-2 border-orange-400 shadow-lg shadow-orange-500/20"
                      >
                        <ShieldAlert size={18} />
                        Saya Paham Risikonya
                      </button>
                    </>
                  )}
                  
                  {/* BERBAHAYA (75-100%) */}
                  {result.is_valid_url !== false && result.score >= 75 && (
                    <button 
                      onClick={resetAnalysis}
                      className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-500/30"
                    >
                      <ShieldX size={20} />
                      Kembali ke Halaman Utama
                    </button>
                  )}
                </div>

                {/* Warning for Invalid URL - Dari File 1 */}
                {result.is_valid_url === false && (
                  <div className="rounded-2xl border-2 border-slate-500/50 bg-slate-500/10 p-4 mt-2">
                    <div className="flex items-start gap-3">
                      <HelpCircle size={24} className="text-slate-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-slate-400 mb-1">⚠️ URL TIDAK VALID</p>
                        <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                          Domain yang Anda masukkan tidak dapat ditemukan di internet. 
                          Periksa kembali ejaan URL Anda dan pastikan domain tersebut ada.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Warning for Dangerous Links - Dari File 1 */}
                {result.is_valid_url !== false && result.score >= 75 && (
                  <div className="rounded-2xl border-2 border-red-500/50 bg-red-500/10 p-4 mt-2">
                    <div className="flex items-start gap-3">
                      <ShieldX size={24} className="text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-red-400 mb-1">⚠️ PERINGATAN KEAMANAN</p>
                        <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                          Sistem kami telah mendeteksi ancaman serius pada URL ini. 
                          Untuk keamanan Anda, akses ke website ini <strong className="text-red-400">DIBLOKIR</strong>. 
                          Jangan mencoba mengakses secara manual melalui browser.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Warning for Suspicious Links - Dari File 1 */}
                {result.is_valid_url !== false && result.score >= 40 && result.score < 75 && (
                  <div className="rounded-2xl border border-orange-500/30 bg-orange-500/5 p-3 mt-2">
                    <div className="flex items-center gap-2 text-xs text-orange-400">
                      <AlertTriangle size={14} />
                      <span>Dengan membuka link ini, Anda bertanggung jawab penuh atas risiko yang mungkin terjadi.</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* FEATURES - Dari File 2 */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-white dark:glass-card p-12 rounded-[50px] border border-slate-200 dark:border-white/5 group hover:border-blue-500/50 transition-all shadow-xl dark:shadow-none">
            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 mb-8 border border-blue-500/20 group-hover:scale-110 transition-transform">
               <Lock size={32} />
            </div>
            <h3 className="text-2xl font-black mb-8 text-slate-900 dark:text-white uppercase tracking-tight">Protokol Keamanan</h3>
            <ul className="space-y-5">
              {["Analisis Reputasi Domain", "Enkripsi SSL Validation", "Phishing Pattern Matching", "Global Threat Database"].map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-slate-600 dark:text-gray-200 text-[15px] font-bold tracking-wide">
                  <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <span className="text-blue-400 text-sm">✓</span>
                  </div>
                  {item}
                </li>
              ))}
            </ul> 
          </div>
          <div className="bg-slate-900 dark:bg-[#0a0a0a] rounded-[50px] p-12 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/5 relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-3xl font-black mb-6 uppercase tracking-tight text-white">Konsultasi AI</h3>
              <p className="text-gray-200 font-semibold text-lg md:text-xl mb-12 leading-relaxed max-w-md">Ingin diskusi lebih lanjut mengenai temuan <span className="text-blue-400">link mencurigakan</span> tersebut?</p>
              <Link href="/chatbot" className="inline-flex items-center gap-3 bg-white text-black px-10 py-5 rounded-2xl font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/10 uppercase tracking-tighter">
                Buka Chatbot AI <ArrowRight size={20} strokeWidth={3} />
              </Link>
            </div>
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] group-hover:opacity-40 transition-opacity"></div>
          </div>
        </div>
      </div>

      {/* FOOTER - Dari File 2 */}
      <footer className="py-20 text-center text-slate-500 dark:text-gray-700 font-black text-[11px] uppercase tracking-[10px] border-t border-slate-200 dark:border-white/5">
        © 2026 CYBERGUARD <span className="text-blue-600/40">INTELLIGENCE</span>
      </footer>

      <style jsx global>{`
        .glass-card {
          background: rgba(15, 23, 42, 0.3);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
      `}</style>
    </main>
  );
}