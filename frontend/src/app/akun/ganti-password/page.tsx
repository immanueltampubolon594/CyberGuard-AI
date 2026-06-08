"use client";

import Navbar from "@/components/Navbar";
import { useState } from "react";
import { Key, ShieldCheck, ChevronLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function GantiPasswordPage() {
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // State untuk input
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleUpdatePassword = async () => {
    setError("");
    
    // Validasi sederhana
    if (!oldPassword || !newPassword) {
      setError("Semua kolom harus diisi!");
      return;
    }

    setLoading(true);

    try {
      // 1. Ambil data user dari memori browser untuk dapat email
      const savedUser = localStorage.getItem("user");
      if (!savedUser) {
        setError("Sesi berakhir, silakan login kembali.");
        setLoading(false);
        return;
      }
      const user = JSON.parse(savedUser);

      // 2. Tembak API Backend kamu
      const response = await fetch("http://localhost:8000/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          old_password: oldPassword,
          new_password: newPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        // Tampilkan pesan error dari Backend (Misal: Password lama salah)
        setError(data.detail || "Gagal memperbarui password.");
      }
    } catch (err) {
      setError("Gagal terhubung ke server backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#020617] flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-[#0c1322] rounded-[45px] p-10 shadow-xl border border-white/[0.08]">
           <Link href="/akun" className="flex items-center gap-2 text-slate-500 hover:text-blue-400 font-bold text-sm mb-8 transition">
              <ChevronLeft size={18} /> Kembali
           </Link>

           {!success ? (
             <>
               <h1 className="text-3xl font-black text-white mb-2">Ganti Password</h1>
               <p className="text-slate-400 font-medium mb-8 text-sm">Pastikan password baru Anda kuat dan unik.</p>
               
               {/* Pesan Error jika gagal */}
               {error && (
                 <div className="mb-6 p-4 bg-red-500/10 text-red-400 rounded-2xl text-xs font-black border border-red-500/20 animate-pulse">
                    ⚠️ {error}
                 </div>
               )}

               <div className="space-y-4">
  {/* Input Password Lama */}
  <div className="space-y-1">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password Lama</label>
    <input 
      type="password" 
      placeholder="Masukkan password lama..." 
      value={oldPassword}
      onChange={(e) => setOldPassword(e.target.value)}
      className="w-full bg-white/[0.03] border-2 border-white/[0.08] rounded-2xl p-4 outline-none focus:border-blue-500 focus:bg-white/[0.05] text-white placeholder:text-slate-600 font-bold transition-all" 
    />
  </div>

  {/* Input Password Baru */}
  <div className="space-y-1">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password Baru</label>
    <input 
      type="password" 
      placeholder="Masukkan password baru..." 
      value={newPassword}
      onChange={(e) => setNewPassword(e.target.value)}
      className="w-full bg-white/[0.03] border-2 border-white/[0.08] rounded-2xl p-4 outline-none focus:border-blue-500 focus:bg-white/[0.05] text-white placeholder:text-slate-600 font-bold transition-all" 
    />
  </div>

  <button 
    onClick={handleUpdatePassword} 
    disabled={loading}
    className="w-full bg-blue-600 text-white py-5 rounded-2xl font-[1000] shadow-xl shadow-blue-900/50 hover:bg-blue-500 transition flex items-center justify-center gap-2 disabled:bg-slate-700 mt-4"
  >
    {loading ? <Loader2 className="animate-spin" /> : "PERBARUI PASSWORD SEKARANG"} 
    {!loading && <ShieldCheck size={20} />}
  </button>
</div>
             </>
           ) : (
             <div className="text-center py-10">
                <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                   <ShieldCheck size={40} strokeWidth={3} />
                </div>
                <h2 className="text-2xl font-black text-white mb-2">Berhasil!</h2>
                <p className="text-slate-400 font-bold mb-8">Password Anda telah diperbarui di database.</p>
                <Link href="/akun" className="inline-flex items-center gap-2 bg-white/[0.05] text-slate-200 px-8 py-3 rounded-xl font-black hover:bg-white/[0.08] transition">
                   Selesai
                </Link>
             </div>
           )}
        </div>
      </div>
    </main>
  );
}