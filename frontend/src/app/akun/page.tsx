"use client";

import Navbar from "@/components/Navbar";
import { useState, useEffect, useRef } from "react";
import { 
  User, Mail, Phone, MapPin, ChevronRight, Key, 
  Settings, LogOut, ShieldCheck, X, Camera, Edit2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const getAvatarKey = (email: string) => `user_avatar__${email}`;

export default function AkunPage() {
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState({
    name: "",
    email: "",
    username: "",
    phone: "",
    location: "",
    avatar: "",
  });

  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    location: "",
    avatar: "",
  });

  useEffect(() => {
    setMounted(true);
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        const email = parsed.email || "";
        const savedAvatar = localStorage.getItem(getAvatarKey(email)) || "";

        const userData = {
          name: parsed.full_name || "User",
          email,
          username: parsed.username || (email ? email.split("@")[0] : "user"),
          phone: parsed.phone || "Belum diatur",
          location: parsed.location || "Belum diatur",
          avatar: savedAvatar,
        };

        setUser(userData);
        window.dispatchEvent(
          new CustomEvent("profileUpdated", { detail: userData })
        );
      } catch {
        localStorage.removeItem("user");
        router.push("/");
      }
    } else {
      router.push("/");
    }
  }, [router]);

  const handleOpenEdit = () => {
    setEditForm({
      name: user.name,
      phone: user.phone === "Belum diatur" ? "" : user.phone,
      location: user.location === "Belum diatur" ? "" : user.location,
      avatar: user.avatar,
    });
    setIsEditModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) { alert("Foto terlalu besar (Max 1MB)"); return; }
    const reader = new FileReader();
    reader.onloadend = () => setEditForm((p) => ({ ...p, avatar: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    let existingData: Record<string, string> = {};
    try { existingData = JSON.parse(localStorage.getItem("user") || "{}"); } catch {}

    const newName     = editForm.name.trim()     || user.name;
    const newPhone    = editForm.phone.trim()    || "Belum diatur";
    const newLocation = editForm.location.trim() || "Belum diatur";
    const newAvatar   = editForm.avatar;

    localStorage.setItem("user", JSON.stringify({
      ...existingData,
      full_name: newName,
      phone: newPhone,
      location: newLocation,
    }));

    const avatarKey = getAvatarKey(user.email);
    if (newAvatar) {
      localStorage.setItem(avatarKey, newAvatar);
    } else {
      localStorage.removeItem(avatarKey);
    }

    const updatedUser = { ...user, name: newName, phone: newPhone, location: newLocation, avatar: newAvatar };
    setUser(updatedUser);
    window.dispatchEvent(new CustomEvent("profileUpdated", { detail: updatedUser }));

    setIsEditModalOpen(false);
    alert("Profil berhasil diperbarui!");
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.push("/");
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-[#020617] flex flex-col font-sans text-slate-300">
      <Navbar />

      <div className="flex-1 max-w-6xl mx-auto w-full py-12 px-8">

        {/* Profile Header - Improved */}
        <div className="bg-gradient-to-br from-[#0c1322] to-[#1a1f3a] rounded-[48px] p-10 shadow-2xl border border-white/[0.08] mb-10 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-blue-800 rounded-[35px] flex items-center justify-center text-white shadow-2xl border-4 border-blue-400/30 overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={60} strokeWidth={2.5} />
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-blue-600 p-2.5 rounded-2xl shadow-lg border-2 border-[#0c1322]">
                <ShieldCheck size={20} className="text-white" />
              </div>
            </div>

            {/* User Info - Centered on mobile, left on desktop */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white uppercase mb-2">
                {user.name}
              </h1>
              <div className="flex items-center justify-center md:justify-start gap-2 text-slate-400">
                <Mail size={16} className="text-blue-500" />
                <p className="font-semibold text-sm md:text-base truncate max-w-md">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Edit Button */}
            <button 
              onClick={handleOpenEdit} 
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black text-sm transition-all active:scale-95 shadow-lg shadow-blue-600/30 border border-blue-500/30"
            >
              <Edit2 size={16} />
              Edit Profil
            </button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Informasi Personal - Left Column */}
          <div className="lg:col-span-2">
            <div className="bg-[#0c1322] rounded-[48px] p-10 shadow-xl border border-white/[0.08]">
              <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-xl">
                  <User size={24} className="text-blue-500" />
                </div>
                Informasi Personal
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: "Nama Lengkap", value: user.name, icon: <User size={18} /> },
                  { label: "Username (Email)", value: user.email, icon: <Mail size={18} /> },
                  { label: "Nomor Telepon", value: user.phone, icon: <Phone size={18} /> },
                  { label: "Lokasi", value: user.location, icon: <MapPin size={18} /> },
                ].map((item, i) => (
                  <div key={i} className="group p-6 bg-white/[0.03] rounded-[24px] border border-white/[0.06] hover:border-blue-500/30 transition-all hover:bg-white/[0.05]">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[2px] mb-3">{item.label}</p>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500 group-hover:bg-blue-500/20 transition-all">
                        {item.icon}
                      </div>
                      <p className="text-base font-bold text-slate-200 truncate">
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pengaturan - Right Column */}
          <div className="lg:col-span-1">
            <div className="bg-[#0c1322] rounded-[48px] p-8 shadow-xl border border-white/[0.08] sticky top-24">
              <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                <div className="p-2 bg-purple-500/10 rounded-xl">
                  <Settings size={20} className="text-purple-500" />
                </div>
                Pengaturan
              </h2>
              
              <div className="space-y-3">
                <Link 
                  href="/akun/ganti-password" 
                  className="group flex items-center justify-between p-5 bg-gradient-to-r from-purple-500/10 to-purple-600/5 hover:from-purple-500/20 hover:to-purple-600/10 rounded-2xl transition-all border border-purple-500/20 hover:border-purple-500/40"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Key size={18} className="text-purple-400" />
                    </div>
                    <span className="font-bold text-slate-200 group-hover:text-white">Ganti Password</span>
                  </div>
                  <ChevronRight size={18} className="text-purple-400 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <button 
                  onClick={handleLogout} 
                  className="w-full group flex items-center justify-between p-5 bg-gradient-to-r from-red-500/10 to-red-600/5 hover:from-red-500/20 hover:to-red-600/10 rounded-2xl transition-all border border-red-500/20 hover:border-red-500/40 mt-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/20 rounded-lg">
                      <LogOut size={18} className="text-red-400" />
                    </div>
                    <span className="font-bold text-slate-200 group-hover:text-white">Logout</span>
                  </div>
                  <ChevronRight size={18} className="text-red-400 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Account Stats */}
              <div className="mt-8 pt-6 border-t border-white/[0.08]">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Status Akun</p>
                <div className="flex items-center gap-2 text-emerald-400">
                  <ShieldCheck size={16} />
                  <span className="text-sm font-bold">Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Edit Profil */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-blue-950/80 backdrop-blur-md overflow-y-auto">
          <form onSubmit={handleSaveProfile} className="bg-[#0c1322] w-full max-w-2xl rounded-[50px] shadow-2xl overflow-hidden animate-in zoom-in duration-300 my-auto border border-white/[0.1]">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-white flex justify-between items-center">
              <h3 className="text-2xl font-black">EDIT INFORMASI PROFIL</h3>
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-white/20 rounded-xl transition-all">
                <X />
              </button>
            </div>

            <div className="p-10 space-y-6">
              {/* Foto Profil */}
              <div className="flex flex-col items-center">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-28 h-28 rounded-3xl bg-white/[0.05] overflow-hidden border-4 border-blue-500/30 flex items-center justify-center shadow-inner group-hover:border-blue-400 transition-all">
                    {editForm.avatar ? (
                      <img src={editForm.avatar} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <Camera size={40} className="text-slate-600" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Camera className="text-white" size={32} />
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                </div>
                <p className="text-[10px] font-black text-blue-400 uppercase mt-3 tracking-widest">Ganti Foto Profil</p>
                {editForm.avatar && (
                  <button type="button" onClick={() => setEditForm((p) => ({ ...p, avatar: "" }))} className="text-[10px] font-bold text-red-400 hover:text-red-300 mt-2 transition-colors">
                    Hapus Foto
                  </button>
                )}
              </div>

              {/* Input Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="Nama Lengkap" 
                    value={editForm.name} 
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} 
                    className="w-full bg-white/[0.03] border-2 border-white/[0.08] rounded-2xl p-4 focus:border-blue-500 focus:bg-white/[0.05] font-bold outline-none transition-all text-white placeholder:text-slate-600" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Username (Email)</label>
                  <input 
                    disabled 
                    type="email" 
                    value={user.email} 
                    className="w-full bg-white/[0.05] border-2 border-white/[0.08] rounded-2xl p-4 font-bold outline-none text-slate-500 cursor-not-allowed" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                  <input 
                    type="text" 
                    placeholder="Nomor Telepon" 
                    value={editForm.phone} 
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} 
                    className="w-full bg-white/[0.03] border-2 border-white/[0.08] rounded-2xl p-4 focus:border-blue-500 focus:bg-white/[0.05] font-bold outline-none transition-all text-white placeholder:text-slate-600" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Location</label>
                  <input 
                    type="text" 
                    placeholder="Kota / Lokasi" 
                    value={editForm.location} 
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} 
                    className="w-full bg-white/[0.03] border-2 border-white/[0.08] rounded-2xl p-4 focus:border-blue-500 focus:bg-white/[0.05] font-bold outline-none transition-all text-white placeholder:text-slate-600" 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-5 rounded-3xl font-black text-lg shadow-xl shadow-blue-900/50 hover:from-blue-500 hover:to-blue-700 transition-all active:scale-95 uppercase tracking-tighter"
              >
                Simpan Semua Perubahan
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}