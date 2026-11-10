"use client";

import Navbar from "@/components/Navbar";
import { useState } from "react";
import {
  Search,
  AlertCircle,
  Loader2,
  Lock,
  ArrowRight,
  Cpu,
  Terminal,
  HelpCircle,
  AlertTriangle,
  Globe,
  FileText,
  ArrowLeft,
  Server,
  CalendarDays,
  RefreshCw,
  Network,
  Building2,
  Layers,
  Link2,
  Copy,
  Check,
  ExternalLink,
  Info,
  ImageOff,
  Tag
} from "lucide-react";
import Link from "next/link";

// Bentuk data dari backend: POST /verify-link -> { success, info }
type InfoLink = {
  url: string;
  url_awal: string;
  diperpendek: boolean;
  domain: string;
  dapat_dijangkau: boolean;
  jenis_situs: string | null;
  jenis_singkat: string;
  kode_jenis: string;
  keyakinan_jenis: string;
  perlu_waspada: boolean;
  ciri: string[];
  judul_halaman: string | null;
  deskripsi_halaman: string | null;
  server: {
    ip: string | null;
    negara: string | null;
    kode_negara: string | null;
    kota: string | null;
    penyedia: string | null;
  } | null;
  domain_info: {
    tanggal_daftar: string | null;
    tanggal_daftar_teks: string | null;
    usia_teks: string | null;
    usia_hari: number | null;
    diperbarui_teks: string | null;
    registrar: string | null;
  } | null;
  screenshot: string | null;
  deskripsi: string;
  catatan: string[];
};

export default function VerifikasiHalaman() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [info, setInfo] = useState<InfoLink | null>(null);
  const [tersalin, setTersalin] = useState(false);

  const handleVerify = async () => {
    if (!url) return;

    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith("http")) {
      formattedUrl = "https://" + formattedUrl;
    }

    setLoading(true);
    setInfo(null);
    setErrorMsg("");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/verify-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: formattedUrl }),
      });

      if (!response.ok) throw new Error("Gagal terhubung ke backend");

      const data = await response.json();

      if (!data.success || !data.info) {
        throw new Error(data.error || "Analisis gagal");
      }

      setInfo(data.info as InfoLink);
      setLoading(false);
    } catch (error: any) {
      // "Failed to fetch" = server tidak bisa dihubungi sama sekali
      const offline = error instanceof TypeError;
      setErrorMsg(
        offline
          ? "Server analisis sedang tidak aktif. Coba lagi beberapa saat lagi."
          : error.message || "Analisis gagal. Silakan coba lagi."
      );
      console.warn("Verifikasi gagal:", error);
      setLoading(false);
    }
  };

  const openUrlSafely = () => {
    if (info) window.open(info.url, "_blank", "noopener,noreferrer");
  };

  const resetAnalysis = () => {
    setInfo(null);
    setUrl("");
  };

  const salinUrl = async () => {
    if (!info) return;
    try {
      await navigator.clipboard.writeText(info.url);
      setTersalin(true);
      setTimeout(() => setTersalin(false), 1500);
    } catch {
      // abaikan: salin tidak didukung di browser ini
    }
  };

  // Teks lokasi server, mis. "Indonesia (Jakarta)"
  const teksServer = (srv: InfoLink["server"]) => {
    if (!srv || !srv.negara) return "Tidak diketahui";
    return srv.kota ? `${srv.negara} (${srv.kota})` : srv.negara;
  };

  return (
    <main className="h-screen flex flex-col overflow-hidden bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white font-sans selection:bg-blue-500/30 transition-colors duration-500">
      <Navbar />

      {/* Area isi: satu-satunya bagian yang bisa di-scroll (seperti chatbot) */}
      <div className="flex-1 overflow-y-auto">
      <div className="min-h-full flex flex-col">

      {/* HERO SECTION - Dari File 2 */}
      <section className="relative pt-8 pb-10 px-12 overflow-hidden border-b border-white/5 text-center">
        <div className="absolute inset-0 pointer-events-none">
           <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[70%] bg-blue-600/10 rounded-full blur-[120px]"></div>
           <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[50%] bg-indigo-600/5 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-5xl mx-auto relative z-10 animate-in fade-in slide-in-from-top-8 duration-1000">
          <div className="inline-flex items-center gap-3 bg-slate-100 dark:bg-white/5 backdrop-blur-md px-6 py-2 rounded-xl border border-slate-200 dark:border-white/10 shadow-lg mb-5 transition-colors">
            <Cpu size={16} className="text-blue-600 dark:text-blue-500" />
            <span className="text-[10px] font-[1000] uppercase tracking-[4px] text-slate-500 dark:text-gray-400">Link Information System</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-[1000] tracking-[2px] uppercase mb-5 leading-[0.9]">
            <span className="text-slate-900 dark:text-white">Kenali </span><span className="text-blue-600">Link</span><br />
            <span className="text-slate-900 dark:text-white">Sebelum </span><span className="text-blue-600">Dibuka</span>
          </h1>

          <p className="text-lg text-slate-600 dark:text-gray-200 max-w-3xl mx-auto leading-relaxed font-semibold">
            Masukkan sebuah link untuk mengetahui jenis situsnya, di negara mana servernya berada, dan kapan domainnya didaftarkan.
          </p>
        </div>
      </section>

      <div className="w-full max-w-6xl mx-auto px-12 -mt-4 relative z-20 pb-8">  
        
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
              placeholder="MASUKKAN LINK YANG INGIN DIKENALI..." 
              className="w-full bg-white dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-[20px] pl-14 pr-36 py-4 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:bg-slate-50 dark:focus:bg-white/10 transition-all text-sm font-black text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-white/40 shadow-xl dark:shadow-inner tracking-tight"
            />
            <button 
              onClick={handleVerify}
              disabled={loading || !url}
              className="absolute right-2 top-2 bottom-2 px-8 bg-blue-600 text-white rounded-[16px] font-[1000] uppercase tracking-widest text-xs hover:bg-blue-500 transition-all flex items-center gap-3 disabled:opacity-40 shadow-lg shadow-blue-500/20 active:scale-95"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} strokeWidth={3} />}
              Cek Link
            </button>
          </div>
        </div>

        {/* PESAN ERROR */}
        {errorMsg && (
          <div className="mt-6 flex items-start gap-3 p-4 rounded-2xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 animate-in fade-in duration-300">
            <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-bold text-red-700 dark:text-red-300">Analisis tidak dapat dilakukan</p>
              <p className="text-sm text-red-600 dark:text-red-200/80 mt-1">{errorMsg}</p>
            </div>
            <button
              onClick={() => setErrorMsg("")}
              className="text-red-400 hover:text-red-600 dark:hover:text-red-200 text-xs font-bold"
            >
              Tutup
            </button>
          </div>
        )}

        {/* HASIL: DESKRIPSI LINK */}
        {info && (
          <div className="mt-12 animate-in fade-in zoom-in duration-700 space-y-5">

            {/* KARTU UTAMA */}
            <div className="rounded-[28px] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f172a]/40 p-5 md:p-7 shadow-xl backdrop-blur-xl">

              {/* Judul kartu + lencana jenis situs */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <Info size={28} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight">Hasil Pengecekan Link</h2>
                    <p className="text-sm text-slate-500 dark:text-gray-400">Informasi tentang link yang Anda masukkan</p>
                  </div>
                </div>
                <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 font-black text-sm uppercase tracking-wide ${
                  info.perlu_waspada
                    ? "border-orange-500/40 bg-orange-500/10 text-orange-500"
                    : "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                }`}>
                  {info.perlu_waspada ? <AlertTriangle size={16} /> : <Tag size={16} />}
                  {info.jenis_singkat}
                </div>
              </div>

              <div className="grid md:grid-cols-5 gap-6">

                {/* KIRI: preview + tombol buka */}
                <div className="md:col-span-2 space-y-4">
                  <div className="rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden bg-white">
                    {info.screenshot ? (
                      <img
                        src={info.screenshot}
                        alt="Preview website"
                        className="w-full aspect-[4/3] object-cover object-top"
                        onError={() => console.error("Gagal load screenshot")}
                      />
                    ) : (
                      <div className="w-full aspect-[4/3] flex flex-col items-center justify-center gap-2 bg-slate-100 dark:bg-white/5 text-slate-400">
                        <ImageOff size={32} />
                        <span className="text-xs font-bold">Preview tidak tersedia</span>
                      </div>
                    )}
                  </div>
                  {info.dapat_dijangkau && (
                    <button
                      onClick={openUrlSafely}
                      className={`w-full font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all border-2 ${
                        info.perlu_waspada
                          ? "border-orange-400 bg-orange-500/10 text-orange-500 hover:bg-orange-500/20"
                          : "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20"
                      }`}
                    >
                      <ExternalLink size={18} />
                      {info.perlu_waspada ? "Saya Paham Risikonya, Buka" : "Buka Website"}
                    </button>
                  )}
                </div>

                {/* KANAN: URL + jenis + daftar detail */}
                <div className="md:col-span-3 space-y-4">

                  <div className="flex items-center gap-3 rounded-2xl bg-slate-100 dark:bg-white/5 px-4 py-3">
                    <Link2 size={22} className="text-blue-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400">Link</p>
                      <p className="font-mono text-sm text-slate-900 dark:text-white truncate">{info.url}</p>
                    </div>
                    <button
                      onClick={salinUrl}
                      title="Salin link"
                      className="p-2 rounded-lg text-slate-500 hover:text-blue-500 hover:bg-blue-500/10 transition-all"
                    >
                      {tersalin ? <Check size={18} className="text-blue-500" /> : <Copy size={18} />}
                    </button>
                  </div>
                  {info.diperpendek && (
                    <p className="text-xs text-slate-500 dark:text-gray-400 -mt-2 px-1">
                      Link pendek <span className="font-mono">{info.url_awal}</span> diarahkan ke alamat di atas.
                    </p>
                  )}

                  <div className="flex items-start gap-3 px-1">
                    <Layers size={22} className="text-blue-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400">Jenis Situs</p>
                      <p className={`text-lg font-black ${info.perlu_waspada ? "text-orange-500" : "text-slate-900 dark:text-white"}`}>
                        {info.jenis_situs ?? "Tidak diketahui"}
                      </p>
                      {info.keyakinan_jenis !== "-" && (
                        <p className="text-xs text-slate-500 dark:text-gray-400">Tingkat keyakinan: <strong>{info.keyakinan_jenis}</strong></p>
                      )}
                    </div>
                  </div>

                  {info.dapat_dijangkau && (
                    <dl className="border-t border-slate-200 dark:border-white/10 pt-4 space-y-3 text-sm">
                      <div className="flex items-center gap-3">
                        <Globe size={20} className="text-blue-500 flex-shrink-0" />
                        <dt className="w-40 text-slate-500 dark:text-gray-400">Negara Server</dt>
                        <dd className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                          {info.server?.kode_negara && (
                            <img
                              src={`https://flagcdn.com/w40/${info.server.kode_negara.toLowerCase()}.png`}
                              alt={info.server.kode_negara}
                              className="h-4 w-6 rounded-sm object-cover"
                              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                            />
                          )}
                          {teksServer(info.server)}
                        </dd>
                      </div>
                      <div className="flex items-center gap-3">
                        <CalendarDays size={20} className="text-blue-500 flex-shrink-0" />
                        <dt className="w-40 text-slate-500 dark:text-gray-400">Domain Terdaftar</dt>
                        <dd className="font-bold text-slate-900 dark:text-white flex flex-wrap items-center gap-2">
                          {info.domain_info?.tanggal_daftar_teks ?? "Tidak diketahui"}
                          {info.domain_info?.usia_teks && (
                            <span className="text-xs font-semibold text-slate-500 dark:text-gray-400">({info.domain_info.usia_teks} yang lalu)</span>
                          )}
                          {info.domain_info?.usia_hari != null && info.domain_info.usia_hari < 180 && (
                            <span className="text-[11px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30">
                              Domain baru
                            </span>
                          )}
                        </dd>
                      </div>
                      {info.domain_info?.diperbarui_teks && (
                        <div className="flex items-center gap-3">
                          <RefreshCw size={20} className="text-blue-500 flex-shrink-0" />
                          <dt className="w-40 text-slate-500 dark:text-gray-400">Terakhir Diperbarui</dt>
                          <dd className="font-bold text-slate-900 dark:text-white">{info.domain_info.diperbarui_teks}</dd>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <Building2 size={20} className="text-blue-500 flex-shrink-0" />
                        <dt className="w-40 text-slate-500 dark:text-gray-400">Pendaftar Domain</dt>
                        <dd className="font-bold text-slate-900 dark:text-white">{info.domain_info?.registrar ?? "Tidak diketahui"}</dd>
                      </div>
                      <div className="flex items-center gap-3">
                        <Server size={20} className="text-blue-500 flex-shrink-0" />
                        <dt className="w-40 text-slate-500 dark:text-gray-400">Penyedia Hosting</dt>
                        <dd className="font-bold text-slate-900 dark:text-white">{info.server?.penyedia ?? "Tidak diketahui"}</dd>
                      </div>
                      <div className="flex items-center gap-3">
                        <Network size={20} className="text-blue-500 flex-shrink-0" />
                        <dt className="w-40 text-slate-500 dark:text-gray-400">Alamat IP</dt>
                        <dd className="font-mono font-bold text-slate-900 dark:text-white">{info.server?.ip ?? "Tidak diketahui"}</dd>
                      </div>
                    </dl>
                  )}
                </div>
              </div>
            </div>

            {/* RINGKASAN + INFORMASI TAMBAHAN */}
            <div className="rounded-[28px] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f172a]/40 p-5 md:p-7 shadow-xl backdrop-blur-xl">
              <div className="grid md:grid-cols-5 gap-6">
                <div className="md:col-span-3">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText size={20} className="text-blue-500" />
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">Ringkasan</h3>
                  </div>
                  <p className="text-sm md:text-base leading-relaxed text-slate-700 dark:text-gray-200">{info.deskripsi}</p>
                </div>

                <div className="md:col-span-2 md:border-l md:border-slate-200 md:dark:border-white/10 md:pl-6">
                  <div className="flex items-center gap-2 mb-3">
                    <HelpCircle size={20} className="text-blue-500" />
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">Informasi Tambahan</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-600 dark:text-gray-300">
                    {info.judul_halaman && (
                      <li className="flex items-start gap-2">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                        <span>Judul halaman: <strong className="text-slate-900 dark:text-white">{info.judul_halaman}</strong></span>
                      </li>
                    )}
                    {info.ciri.map((c, i) => (
                      <li key={`ciri-${i}`} className="flex items-start gap-2">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                        <span>Ciri di halaman: {c}</span>
                      </li>
                    ))}
                    {info.catatan.map((c, i) => (
                      <li key={`cat-${i}`} className="flex items-start gap-2">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400 flex-shrink-0" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {info.perlu_waspada && (
                <div className="mt-5 flex items-center gap-2 rounded-xl border border-orange-500/30 bg-orange-500/5 px-4 py-3 text-xs text-orange-500">
                  <AlertTriangle size={14} className="flex-shrink-0" />
                  <span>Jenis situs ini perlu diwaspadai. Dengan membuka link ini, Anda bertanggung jawab atas risiko yang mungkin terjadi.</span>
                </div>
              )}
            </div>

            {/* CEK LINK LAIN */}
            <button
              onClick={resetAnalysis}
              className="w-full rounded-2xl border-2 border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-black py-4 flex items-center justify-center gap-2 transition-all"
            >
              <ArrowLeft size={18} />
              Cek Link Lain
            </button>
          </div>
        )}

        {/* FEATURES - Dari File 2 */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-900/60 dark:backdrop-blur-xl p-8 rounded-[40px] border border-slate-200 dark:border-white/10 group hover:border-blue-500/50 transition-all shadow-xl dark:shadow-none">
            <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 mb-5 border border-blue-500/20 group-hover:scale-110 transition-transform">
               <Lock size={32} />
            </div>
            <h3 className="text-2xl font-black mb-5 text-slate-900 dark:text-white uppercase tracking-tight">Informasi yang Ditampilkan</h3>
            <ul className="space-y-3">
              {["Jenis Situs dari Isi Halaman", "Lokasi Negara Server", "Tanggal Domain Terdaftar", "Pratinjau Tampilan Website"].map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-slate-600 dark:text-gray-200 text-[15px] font-bold tracking-wide">
                  <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <span className="text-blue-400 text-sm">✓</span>
                  </div>
                  {item}
                </li>
              ))}
            </ul> 
          </div>
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 dark:from-blue-950/70 dark:via-slate-900/60 dark:to-slate-900/60 dark:backdrop-blur-xl rounded-[40px] p-8 shadow-xl dark:shadow-none border border-slate-800 dark:border-white/10 hover:border-blue-500/50 transition-all relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-3xl font-black mb-4 uppercase tracking-tight text-white">Konsultasi AI</h3>
              <p className="text-gray-200 font-semibold text-lg md:text-xl mb-8 leading-relaxed max-w-md">Ingin diskusi lebih lanjut mengenai temuan <span className="text-blue-400">link mencurigakan</span> tersebut?</p>
              <Link href="/chatbot" className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-2xl font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/10 uppercase tracking-tighter">
                Buka Chatbot AI <ArrowRight size={20} strokeWidth={3} />
              </Link>
            </div>
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-600/20 rounded-full blur-[100px] group-hover:opacity-60 transition-opacity"></div>
          </div>
        </div>
      </div>

      {/* FOOTER - Dari File 2 */}
      <footer className="mt-auto py-5 text-center text-slate-500 dark:text-gray-500 font-black text-[11px] uppercase tracking-[10px] border-t border-slate-200 dark:border-white/5">
        © 2026 CYBERGUARD <span className="text-blue-600/40">INTELLIGENCE</span>
      </footer>
      </div>
      </div>

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