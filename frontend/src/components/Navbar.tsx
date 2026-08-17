"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, 
  BookOpen, 
  MessageCircle, 
  User, 
  LogOut, 
 ShieldAlert,
  Zap,
  Sun,
  Moon
} from 'lucide-react';
// ─────────────────────────────────────────────────────
// Sama persis dengan AkunPage — avatar unik per email
// ─────────────────────────────────────────────────────
const getAvatarKey = (email: string) => `user_avatar__${email}`;

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userData, setUserData] = useState({ name: "Guest", avatar: "" });
  const [isDark, setIsDark] = useState(true);

  // Sinkronisasi Tema saat Refresh
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  // Baca user + avatar dari localStorage
  const loadUserData = () => {
    try {
      const saved = localStorage.getItem("user");
      if (!saved) {
        setUserData({ name: "Guest", avatar: "" });
        return;
      }
      const parsed = JSON.parse(saved);
      const email = parsed.email || "";

      // Avatar dibaca dari key per-email — sama dengan AkunPage
      const avatar = localStorage.getItem(getAvatarKey(email)) || "";

      setUserData({
        name: parsed.full_name || parsed.name || "User",
        avatar,
      });
    } catch {
      setUserData({ name: "Guest", avatar: "" });
    }
  };

  useEffect(() => {
    loadUserData();

    // Mendengarkan perubahan storage dari tab lain
    window.addEventListener("storage", loadUserData);

    // Mendengarkan event dari AkunPage saat profil diperbarui
    // Menggunakan detail dari CustomEvent agar update INSTAN
    // tanpa perlu baca ulang localStorage
    const handleProfileUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.name !== undefined) {
        // Update langsung dari payload event — tidak perlu baca localStorage
        setUserData({
          name: detail.name || "User",
          avatar: detail.avatar || "",
        });
      } else {
        // Fallback: baca ulang dari localStorage
        loadUserData();
      }
    };

    window.addEventListener("profileUpdated", handleProfileUpdate);

    return () => {
      window.removeEventListener("storage", loadUserData);
      window.removeEventListener("profileUpdated", handleProfileUpdate);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    // Avatar TIDAK dihapus — tetap ada per email
    router.push("/");
  };

  const isActive = (path: string) => pathname === path;

  return (
<nav className="flex items-center justify-between px-4 py-5 bg-white/80 dark:bg-[#030712]/90 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 sticky top-0 z-[100] font-sans shadow-xl dark:shadow-2xl transition-colors duration-500">
      
      {/* 1. LOGO */}
   <Link href="/beranda" className="flex items-center gap-3 cursor-pointer group flex-shrink-0">
        <div className="relative">
       <img src="/logo.png" alt="Logo" className="h-16 w-16 object-contain transition-all duration-500 group-hover:scale-110" />
          <div className="absolute inset-0 bg-blue-600/20 blur-xl rounded-full scale-150 -z-10"></div>
        </div>
        <div className="flex flex-col">
        <h1 className="text-slate-900 dark:text-white font-[1000] text-2xl tracking-tighter uppercase leading-none">
            CYBERGUARD <span className="text-blue-500 italic">AI</span>
          </h1>
        </div>
      </Link>

      {/* 2. MENU NAVIGASI */}
     <div className="hidden lg:flex items-center gap-2 ml-4 mr-4">
        {[
          { name: "BERANDA",     path: "/beranda",    icon: <Home size={14}/> },
          { name: "PEMBELAJARAN",path: "/pembelajaran",icon: <BookOpen size={14}/> },
          { name: "CHATBOT AI",  path: "/chatbot",    icon: <MessageCircle size={14}/> },
          { name: "VERIFIKASI",  path: "/verifikasi", icon: <ShieldAlert size={14}/> },
        ].map((item) => (
          <Link 
            key={item.path} 
            href={item.path} 
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full transition-all text-[11px] font-black tracking-widest whitespace-nowrap ${
  isActive(item.path) 
    ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] border border-blue-400/50" 
    : "text-slate-500 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
}`}
          >
            {item.icon} {item.name}
          </Link>
        ))}
      </div>

{/* 3. PROFIL, TEMA & LOGOUT */}
<div className="flex items-center gap-6">
        
        {/* TOMBOL SAKLAR TEMA */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-blue-400 hover:scale-110 transition-all duration-300"
          title={isDark ? "Mode Terang" : "Mode Gelap"}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <Link 
          href="/akun" 
          className={`flex items-center gap-3 p-1.5 pr-6 rounded-full border transition-all duration-300 group ${
            isActive('/akun') 
              ? 'bg-blue-600/10 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
              : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none'
          }`}
        >
          <div className="w-9 h-9 bg-white dark:bg-[#030712] rounded-full overflow-hidden flex items-center justify-center text-blue-500 border border-slate-200 dark:border-white/10 group-hover:border-blue-500 flex-shrink-0 shadow-inner">
            {userData.avatar ? (
              <img src={userData.avatar} alt={userData.name} className="w-full h-full object-cover" />
            ) : (
              <User size={18} strokeWidth={3} />
            )}
          </div>
          
          <div className="flex flex-col items-start">
            <span className="text-[11px] font-black tracking-tight text-slate-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-white transition-colors uppercase">
              {userData.name}
            </span>
            <div className="flex items-center gap-1">
              <Zap size={8} className="text-yellow-400 fill-yellow-400 animate-pulse" />
              <span className="text-[8px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">Master Tier</span>
            </div>
          </div>
        </Link>

        <button 
          onClick={handleLogout}
          className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[2px] text-red-500/70 hover:text-red-500 transition-all"
        >
          <LogOut size={16} strokeWidth={3} />
          <span className="hidden xl:inline">KELUAR</span>
        </button>
      </div>
      </nav>
  );
}


