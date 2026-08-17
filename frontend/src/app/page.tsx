"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  User, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, ShieldCheck, Phone, MapPin
} from "lucide-react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const endpoint = isLogin ? "/auth/login" : "/auth/register";
    const payload = isLogin
      ? { email, password }
      : { full_name: fullName, email, password, phone, location };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          localStorage.setItem("user", JSON.stringify(data.user));
          localStorage.setItem("token", data.access_token);
          router.push("/beranda");
        } else {
          alert("Pendaftaran Berhasil! Silakan masuk.");
          setIsLogin(true);
        }
      } else {
        alert(data.detail || "Terjadi kesalahan.");
      }
    } catch (error) {
      alert("Gagal terhubung ke server backend.");
    } finally {
      setLoading(false);
    }
  };

  const baseInput: React.CSSProperties = {
    width: "100%",
    backgroundColor: "#071020",
    border: "1.5px solid #162540",
    borderRadius: "10px",
    padding: "13px 16px 13px 44px",
    color: "#e2e8f0",
    fontSize: "14px",
    fontWeight: 500,
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "#3b82f6";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.18)";
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "#162540";
    e.currentTarget.style.boxShadow = "none";
  };

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", position: "relative", overflow: "hidden", backgroundColor: "#020617" }}>

      {/* Glow blobs */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 50% at 50% -5%, rgba(37,99,235,0.22), transparent)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "-10%", left: "5%", width: "550px", height: "550px", background: "radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-15%", right: "0%", width: "480px", height: "480px", background: "radial-gradient(circle, rgba(79,70,229,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Top badge */}
      <div style={{ position: "absolute", top: "28px", left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: "8px", background: "rgba(37,99,235,0.1)", border: "1px solid rgba(59,130,246,0.2)", padding: "7px 20px", borderRadius: "999px", backdropFilter: "blur(12px)", whiteSpace: "nowrap" }}>
        <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#3b82f6", flexShrink: 0 }} />
        <span style={{ fontSize: "9px", fontWeight: 900, color: "#93c5fd", textTransform: "uppercase", letterSpacing: "3px" }}>Platform Keamanan Siber</span>
      </div>

      {/* Card */}
      <div style={{ width: "100%", maxWidth: "440px", position: "relative", zIndex: 10 }}>
        <div style={{ background: "rgba(7,16,32,0.85)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)", border: "1px solid rgba(59,130,246,0.12)", borderRadius: "36px", boxShadow: "0 0 80px rgba(37,99,235,0.1), 0 30px 60px rgba(0,0,0,0.6)", overflow: "hidden" }}>

          {/* Top accent */}
          <div style={{ height: "2px", background: "linear-gradient(90deg, transparent, #3b82f6, transparent)" }} />

          <div style={{ padding: "40px 44px 36px" }}>

            {/* Branding */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "30px", textAlign: "center" }}>
              <div style={{ background: "rgba(37,99,235,0.1)", border: "1px solid rgba(59,130,246,0.22)", padding: "16px", borderRadius: "22px", marginBottom: "14px", boxShadow: "0 0 28px rgba(37,99,235,0.18)" }}>
                <img src="/logo.png" alt="Logo" style={{ height: "54px", width: "auto", objectFit: "contain" }} />
              </div>
              <h1 style={{ fontSize: "20px", fontWeight: 900, color: "#60a5fa", letterSpacing: "1px", textTransform: "uppercase", margin: 0 }}>CyberGuard</h1>
              <p style={{ fontSize: "9px", fontWeight: 800, color: "#1e3a5f", textTransform: "uppercase", letterSpacing: "3px", marginTop: "6px" }}>Intelligent Security Platform</p>
            </div>

            {/* Judul */}
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <h2 style={{ fontSize: "27px", fontWeight: 900, color: "#f1f5f9", letterSpacing: "-0.3px", margin: "0 0 6px 0" }}>
                {isLogin ? "Selamat Datang" : "Daftar Akun"}
              </h2>
              <p style={{ fontSize: "13px", color: "#475569", margin: 0 }}>
                {isLogin ? "Masuk ke sistem keamanan Anda" : "Bergabung dengan platform CyberGuard"}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "11px" }}>

              {/* Nama Lengkap */}
              {!isLogin && (
                <div style={{ position: "relative" }}>
                  <User style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#334155", pointerEvents: "none" }} size={15} />
                  <input required value={fullName} onChange={(e) => setFullName(e.target.value)} type="text" placeholder="Nama Lengkap" style={baseInput} onFocus={onFocus} onBlur={onBlur} />
                </div>
              )}

              {/* Email */}
              <div style={{ position: "relative" }}>
                <Mail style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#334155", pointerEvents: "none" }} size={15} />
                <input required value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Alamat Email" style={baseInput} onFocus={onFocus} onBlur={onBlur} />
              </div>

              {/* Telepon & Lokasi */}
              {!isLogin && (
                <>
                  <div style={{ position: "relative" }}>
                    <Phone style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#334155", pointerEvents: "none" }} size={15} />
                    <input required value={phone} onChange={(e) => setPhone(e.target.value)} type="text" placeholder="Nomor Telepon" style={baseInput} onFocus={onFocus} onBlur={onBlur} />
                  </div>
                  <div style={{ position: "relative" }}>
                    <MapPin style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#334155", pointerEvents: "none" }} size={15} />
                    <input required value={location} onChange={(e) => setLocation(e.target.value)} type="text" placeholder="Lokasi" style={baseInput} onFocus={onFocus} onBlur={onBlur} />
                  </div>
                </>
              )}

              {/* Password */}
              <div style={{ position: "relative" }}>
                <Lock style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#334155", pointerEvents: "none" }} size={15} />
                <input
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  placeholder="Kata Sandi"
                  style={{ ...baseInput, paddingRight: "48px" }}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", color: "#334155", background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Submit */}
              <div style={{ paddingTop: "6px" }}>
                <button
                  disabled={loading}
                  type="submit"
                  style={{ width: "100%", background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)", color: "#fff", padding: "15px 0", borderRadius: "12px", fontWeight: 900, fontSize: "15px", border: "none", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 4px 24px rgba(37,99,235,0.45)", transition: "transform 0.15s, box-shadow 0.15s", opacity: loading ? 0.65 : 1 }}
                  onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = "scale(1.02)"; e.currentTarget.style.boxShadow = "0 6px 32px rgba(37,99,235,0.6)"; } }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(37,99,235,0.45)"; }}
                >
                  {loading
                    ? <Loader2 size={22} style={{ animation: "spin 1s linear infinite" }} />
                    : <>{isLogin ? "Masuk ke Sistem" : "Buat Akun"} <ArrowRight size={18} strokeWidth={3} /></>
                  }
                </button>
              </div>
            </form>

            {/* Toggle */}
            <div style={{ marginTop: "22px", textAlign: "center" }}>
              <button
                onClick={() => { setIsLogin(!isLogin); setFullName(""); setEmail(""); setPassword(""); setPhone(""); setLocation(""); }}
                style={{ fontSize: "13px", fontWeight: 900, color: "#60a5fa", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", textDecorationColor: "rgba(96,165,250,0.35)", textUnderlineOffset: "4px" }}
              >
                {isLogin ? "Belum punya akun? Daftar Gratis" : "Sudah punya akun? Login di sini"}
              </button>
            </div>

          </div>

          {/* Bottom accent */}
          <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.25), transparent)" }} />
        </div>
      </div>

      {/* Footer */}
      <p style={{ position: "absolute", bottom: "24px", left: "50%", transform: "translateX(-50%)", color: "rgba(255,255,255,0.15)", fontSize: "9px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "4px", whiteSpace: "nowrap", margin: 0 }}>
        © 2026 CyberGuard
      </p>

      <style>{`
        input::placeholder { color: #2d4a6b !important; }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0px 1000px #071020 inset !important;
          -webkit-text-fill-color: #e2e8f0 !important;
          caret-color: #e2e8f0;
          transition: background-color 9999s ease-in-out 0s;
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}
