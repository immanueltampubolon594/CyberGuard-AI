"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert, Brain, Terminal, Fingerprint, Lock, Mail, MessageCircle,
  AlertTriangle, ArrowRight, CheckCircle, XCircle, ChevronRight,
  Globe, Smartphone, Eye, Shield, Search, Zap, BookOpen,
  AlertCircle, ExternalLink, Users, Key, Clock, TriangleAlert,
  QrCode, Target, Copy,
} from "lucide-react";
import data from "./phishing.json";

// ─── Icon map ─────────────────────────────────────────────────────────────────
const iconMap: Record<string, React.ReactNode> = {
  ShieldAlert:    <ShieldAlert size={15} />,
  Brain:          <Brain size={15} />,
  Terminal:       <Terminal size={15} />,
  Fingerprint:    <Fingerprint size={15} />,
  Lock:           <Lock size={15} />,
  Mail:           <Mail size={15} />,
  MessageCircle:  <MessageCircle size={15} />,
  Smartphone:     <Smartphone size={15} />,
  QrCode:         <QrCode size={15} />,
  Globe:          <Globe size={15} />,
  Target:         <Target size={15} />,
  Copy:           <Copy size={15} />,
};

// ─── Small UI helpers ─────────────────────────────────────────────────────────
function Tag({ text, color }: { text: string; color: string }) {
  const map: Record<string, string> = {
    blue:   "bg-blue-500/10  text-blue-300  border-blue-500/25",
    emerald:"bg-emerald-500/10 text-emerald-300 border-emerald-500/25",
    yellow: "bg-yellow-500/10 text-yellow-300 border-yellow-500/25",
    red:    "bg-red-500/10   text-red-300   border-red-500/25",
    violet: "bg-violet-500/10 text-violet-300 border-violet-500/25",
    cyan:   "bg-cyan-500/10  text-cyan-300  border-cyan-500/25",
  };
  return (
    <span className={`text-[9px] font-black px-2.5 py-1 rounded-full border uppercase tracking-widest ${map[color] ?? map.blue}`}>
      {text}
    </span>
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[3px] mb-4 flex items-center gap-2">
      <span className="w-3 h-px bg-slate-600" /> {text}
    </p>
  );
}

function CaseBox({ c }: { c: any }) {
  return (
    <div className="p-6 rounded-2xl border border-amber-500/15 bg-amber-500/[0.04]">
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle size={13} className="text-amber-400 shrink-0" />
        <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Kasus Nyata</p>
      </div>
      <p className="text-sm font-bold text-slate-200 mb-2">{c.title}</p>
      <p className="text-sm text-slate-400 leading-relaxed mb-4">{c.story}</p>
      <div className="flex items-start gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.07]">
        <CheckCircle size={12} className="text-emerald-400 mt-0.5 shrink-0" />
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

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PhishingPage() {
  const [activeTier, setActiveTier] = useState(1);
  const tiersNav = data.navigation ?? [];
  const tiers = data.tiers_content as any;
  const t = tiers[activeTier.toString()];
  const totalTiers = tiersNav.length;
  
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTier]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-600 dark:text-slate-300 font-sans transition-colors duration-500">
      <div className="flex">

        {/* ── SIDEBAR ── */}
        <aside className="fixed left-0 top-20 w-72 h-[calc(100vh-5rem)] border-r border-slate-200 dark:border-slate-800/60 px-6 py-8 hidden lg:flex flex-col bg-white dark:bg-[#020617] z-10 overflow-y-auto transition-all">

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 mb-6 uppercase tracking-widest">
            <Link href="/pembelajaran" className="hover:text-slate-400 transition-colors">Pembelajaran</Link>
            <ChevronRight size={10} />
            <span className="text-blue-500">Phishing</span>
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
                  <div className={`mt-0.5 shrink-0 ${isActive ? "text-blue-400" : "text-slate-600"}`}>
                    {iconMap[tier.icon]}
                  </div>
                  <div>
                    <p className={`text-[9px] font-black uppercase tracking-widest mb-0.5 ${isActive ? "text-blue-500" : "text-slate-600"}`}>
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
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-wider">Progress</p>
              <p className="text-[11px] font-bold text-slate-400">{activeTier}/{totalTiers}</p>
            </div>
            <div className="h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${(activeTier / totalTiers) * 100}%` }}
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
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{t?.tag}</span>
            </div>
            <div className="text-[11px] text-slate-600 font-semibold hidden sm:block">
              {activeTier}/{totalTiers} Topik
            </div>
          </div>

          <div className="px-8 lg:px-12 xl:px-16 py-12 w-full max-w-none">

            {/* Page title */}
            <div className="mb-10">
              <p className="text-blue-500 text-[11px] font-black tracking-[6px] uppercase mb-3">Phishing</p>
              <h1 className="text-5xl xl:text-6xl font-[1000] text-slate-900 dark:text-white leading-tight tracking-tighter">
                {t?.subtitle}
              </h1>
              <div className="mt-4 h-px bg-gradient-to-r from-blue-600/40 via-blue-500/20 to-transparent" />
            </div>

            <div className="space-y-12">

              {t?.quote && (
                <blockquote className="border-l-4 border-blue-600 dark:border-blue-500 pl-8 bg-blue-50/50 dark:bg-transparent py-4 rounded-r-xl">
                  <p className="text-xl italic text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                    "{t.quote}"
                  </p>
                </blockquote>
              )}

              {t?.definition && (
                <div className="space-y-6">
                  {t.definition.split("\n\n").map((paragraph: string, index: number) => (
                    <p
                      key={index}
                      className="text-lg leading-9 text-slate-700 dark:text-slate-300"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              )}

              {t?.content && (
                <div className="space-y-8">
                  {t.content.map((paragraph: string, index: number) => (
                    <p
                      key={index}
                      className="text-lg leading-9 text-slate-700 dark:text-slate-300"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              )}

              {t?.sections?.map((section: any, index: number) => (
                <div key={index} className="space-y-6">
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white pt-10 border-t border-slate-100 dark:border-white/5">
                    {section.title}
                  </h2>

                  {section.content.map((paragraph: string, pIndex: number) => (
                    <p
                      key={pIndex}
                      className="text-lg leading-9 text-slate-700 dark:text-slate-300"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              ))}

              {/* Case Study */}
              {t?.case_study && (
                <div className="p-10 rounded-3xl border border-blue-200 dark:border-blue-500/20 bg-white dark:bg-blue-500/[0.03] shadow-xl dark:shadow-none">
                  <p className="text-xs font-black tracking-widest text-blue-400 uppercase mb-3">
                    Studi Kasus
                  </p>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                    {t.case_study.title}
                  </h3>
                  <p className="text-lg leading-9 text-slate-700 dark:text-slate-300 mb-6">
                    {t.case_study.story}
                  </p>
                  <div className="border-l-4 border-emerald-500 pl-5">
                    <p className="text-slate-700 dark:text-slate-200">
                      {t.case_study.lesson}
                    </p>
                  </div>
                </div>
              )}

              {/* ✅ REFERENCES SECTION - SIMPLE LIST */}
              {t?.references && (
                <ReferencesSection references={t.references} />
              )}

            </div>

            {/* ── PREV / NEXT ── */}
            <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between">
              <button
                onClick={() => activeTier > 1 && setActiveTier(activeTier - 1)}
                className={`flex items-center gap-3 text-[13px] font-black uppercase tracking-wider text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors ${activeTier === 1 ? "invisible" : ""}`}
              >
                <ArrowRight size={16} className="rotate-180" /> Topik Sebelumnya
              </button>

              {activeTier < totalTiers ? (
                <button
                  onClick={() => setActiveTier(activeTier + 1)}
                  className="flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-xl text-[12px] font-black uppercase tracking-wider transition-all"
                >
                  Topik Berikutnya <ArrowRight size={14} />
                </button>
              ) : (
                <Link
                  href="/pembelajaran"
                  className="flex items-center gap-3 bg-white hover:bg-slate-100 text-[#020617] px-8 py-3.5 rounded-xl text-[12px] font-black uppercase tracking-wider transition-all"
                >
                  Selesai <ArrowRight size={14} />
                </Link>
              )}
            </div>

          </div>{/* end px container */}
        </main>
      </div>
    </div>
  );
}