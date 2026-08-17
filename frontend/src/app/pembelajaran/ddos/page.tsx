"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert, Zap, Globe, Network, Timer, Server,
  AlertTriangle, ArrowRight, CheckCircle, ChevronRight, BookOpen, ExternalLink,
} from "lucide-react";
import data from "./ddos.json";

// ── Icon map ─────────────────────────────────────────────────────────────────
const iconMap: Record<string, React.ReactNode> = {
  ShieldAlert: <ShieldAlert size={15} />,
  Zap: <Zap size={15} />,
  Globe: <Globe size={15} />,
  Network: <Network size={15} />,
  Timer: <Timer size={15} />,
  Server: <Server size={15} />,
};

// ─── Small UI helpers ─────────────────────────────────────────────────────────
function CaseBox({ c }: { c: any }) {
  return (
    <div className="p-6 rounded-2xl border border-amber-200 dark:border-amber-500/15 bg-amber-50 dark:bg-amber-500/[0.04]">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={13} className="text-amber-500 dark:text-amber-400 shrink-0" />
        <p className="text-[10px] font-black text-amber-500 dark:text-amber-400 uppercase tracking-widest">Kasus Nyata</p>
      </div>
      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">{c.title}</p>
      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">{c.story}</p>
      <div className="flex items-start gap-2 p-3 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.07]">
        <CheckCircle size={12} className="text-emerald-500 dark:text-emerald-400 mt-0.5 shrink-0" />
        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{c.lesson}</p>
      </div>
    </div>
  );
}

// ─── References Section Component (SIMPLE) ───────────────────────────────────
function ReferencesSection({ references }: { references: string[] }) {
  if (!references || references.length === 0) return null;

  // Parse format: "URL - Deskripsi"
  const parseReference = (ref: string) => {
    const parts = ref.split(" - ");
    if (parts.length >= 2) {
      return {
        url: parts[0].trim(),
        description: parts.slice(1).join(" - ").trim()
      };
    }
    return {
      url: ref,
      description: "Baca sumber"
    };
  };

  return (
    <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          Sumber Referensi
        </h3>
        <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold">
          {references.length}
        </span>
      </div>

      {/* References List */}
      <ol className="list-decimal list-inside space-y-3 ml-2">
        {references.map((ref, idx) => {
          const { url, description } = parseReference(ref);
          
          return (
            <li key={idx} className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-700 dark:hover:text-blue-300 transition-colors inline-flex items-center gap-1.5"
              >
                {description}
                <ExternalLink size={12} className="inline" />
              </a>
            </li>
          );
        })}
      </ol>

      {/* Footer Note */}
      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700/50">
        <p className="text-xs text-slate-500 dark:text-slate-400 italic">
          * Klik pada setiap referensi untuk mengakses sumber asli
        </p>
      </div>

    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function DDoSPage() {
  const [activeTier, setActiveTier] = useState(0);
  const tiersNav = data.navigation ?? [];
  const tiers = data.tiers_content as any;
  const t = tiers[activeTier.toString()];
  const totalTiers = tiersNav.length;

  // Auto scroll ke atas saat topik berganti
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTier]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-600 dark:text-slate-300 font-sans transition-colors duration-500">
      <div className="flex">

        {/* ── SIDEBAR ── */}
        <aside className="fixed left-0 top-20 w-72 h-[calc(100vh-5rem)] border-r border-slate-200 dark:border-slate-800/60 px-6 py-8 hidden lg:flex flex-col bg-white dark:bg-[#020617] z-10 overflow-y-auto transition-all">

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-600 mb-6 uppercase tracking-widest">
            <Link href="/pembelajaran" className="hover:text-slate-600 dark:hover:text-slate-400 transition-colors">Pembelajaran</Link>
            <ChevronRight size={10} />
            <span className="text-blue-500">DDoS / DoS Attack</span>
          </div>

          {/* Nav */}
          <nav className="space-y-1.5 flex-1">
            {tiersNav.map((tier: any) => {
              const isActive = activeTier === tier.id;
              return (
                <button
                  key={tier.id}
                  onClick={() => setActiveTier(tier.id)}
                  className={`w-full flex items-start gap-3 px-4 py-3.5 rounded-xl border transition-all text-left ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-600/10 border-blue-200 dark:border-blue-500/25 text-blue-600 dark:text-blue-300 shadow-sm"
                      : "border-transparent text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.03]"
                  }`}
                >
                  <div className={`mt-0.5 shrink-0 ${isActive ? "text-blue-500 dark:text-blue-400" : "text-slate-400 dark:text-slate-600"}`}>
                    {iconMap[tier.icon]}
                  </div>
                  <div>
                    <p className={`text-[9px] font-black uppercase tracking-widest mb-0.5 ${isActive ? "text-blue-500" : "text-slate-400 dark:text-slate-600"}`}>
                      Topik {String(tier.id).padStart(2, "0")}
                    </p>
                    <p className="text-[12px] font-bold leading-tight">{tier.label}</p>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Progress */}
          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800/60">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-wider">Progress</p>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{activeTier}/{totalTiers - 1}</p>
            </div>
            <div className="h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${(activeTier / (totalTiers - 1)) * 100}%` }}
              />
            </div>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 lg:ml-72 min-h-screen bg-slate-50 dark:bg-[#020617]">

          {/* Top bar */}
          <div className="sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800/60 bg-white/80 dark:bg-[#020617]/95 backdrop-blur-xl px-8 lg:px-16 py-4 flex items-center justify-between transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest px-2.5 py-1 rounded-md border border-blue-500/20 bg-blue-500/8">
                Topik {String(activeTier).padStart(2, "0")}
              </span>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{t?.subtitle}</span>
            </div>
            <div className="text-[11px] text-slate-400 dark:text-slate-600 font-semibold hidden sm:block">
              {activeTier}/{totalTiers - 1} Topik
            </div>
          </div>

          <div className="px-8 lg:px-12 xl:px-16 py-12 w-full max-w-none">

            {/* Page title */}
            <div className="mb-10">
              <p className="text-blue-500 text-[11px] font-black tracking-[6px] uppercase mb-3">DDoS / DoS Attack</p>
              <h1 className="text-5xl xl:text-6xl font-extrabold text-slate-900 dark:text-white leading-tight">
                {t?.subtitle}
              </h1>
              <div className="mt-4 h-px bg-gradient-to-r from-blue-600/40 via-blue-500/20 to-transparent" />
            </div>

            <div className="space-y-12 max-w-8xl">

              {t?.quote && (
                <blockquote className="border-l-4 border-blue-600 dark:border-blue-500 pl-8">
                  <p className="text-xl italic text-slate-700 dark:text-slate-200 leading-relaxed">
                    "{t.quote}"
                  </p>
                </blockquote>
              )}

              {t?.definition && (
                <div className="space-y-6">
                  {t.definition.split("\n\n").map((paragraph: string, index: number) => (
                    <p
                      key={index}
                      className="text-lg leading-9 text-slate-800 dark:text-slate-300"
                      style={{ textAlign: 'justify', textJustify: 'inter-word' }}
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              )}

              {t?.sections?.map((section: any, index: number) => (
                <div key={index} className="space-y-6 pt-4">

                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                    {section.title}
                  </h2>

                  {section.content.map((paragraph: string, pIndex: number) => (
                    <p
                      key={pIndex}
                      className="text-lg leading-9 text-slate-800 dark:text-slate-300"
                      style={{ textAlign: 'justify', textJustify: 'inter-word' }}
                    >
                      {paragraph}
                    </p>
                  ))}

                </div>
              ))}

              {/* Case Study */}
              {t?.case_study && (
                <div className="pt-6">
                  <CaseBox c={t.case_study} />
                </div>
              )}

              {/* ✅ REFERENCES SECTION - SIMPLE LIST */}
              {t?.references && <ReferencesSection references={t.references} />}

              {/* ── PREV / NEXT ── */}
              <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between">
                <button
                  onClick={() => activeTier > 0 && setActiveTier(activeTier - 1)}
                  className={`flex items-center gap-3 text-[13px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors ${activeTier === 0 ? "invisible" : ""}`}
                >
                  <ArrowRight size={16} className="rotate-180" /> Topik Sebelumnya
                </button>

                {activeTier < totalTiers - 1 ? (
                  <button
                    onClick={() => setActiveTier(activeTier + 1)}
                    className="flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-xl text-[12px] font-black uppercase tracking-wider transition-all"
                  >
                    Topik Berikutnya <ArrowRight size={14} />
                  </button>
                ) : (
                  <Link
                    href="/pembelajaran"
                    className="flex items-center gap-3 bg-slate-900 hover:bg-slate-700 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-[#020617] px-8 py-3.5 rounded-xl text-[12px] font-black uppercase tracking-wider transition-all"
                  >
                    Selesai <ArrowRight size={14} />
                  </Link>
                )}
              </div>

            </div>

          </div>{/* end px container */}
        </main>
      </div>
    </div>
  );
}
