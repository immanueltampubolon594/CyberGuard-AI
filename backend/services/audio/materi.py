"""
Tugas B - Tahap 5b: Rekomendasi materi pembelajaran dari isi audio

Katalog di bawah mengacu pada materi yang SUDAH ADA di halaman Pembelajaran
(folder frontend/src/app/pembelajaran/<slug>). Hanya materi di katalog ini yang
boleh direkomendasikan, jadi Gemini tidak bisa mengarang materi yang tidak ada.

Kode materi berbentuk "<slug>:<nomor topik>", contoh "scam-online:2"
= materi "Scam & Penipuan Online", topik "Giveaway & Hadiah Palsu".

Cara memilih materi (berurutan):
  1. Pilihan Gemini (lebih paham konteks percakapan).
  2. Pola yang terdeteksi aturan (cadangan jika Gemini tidak tersedia).
  3. Jika suara terindikasi buatan AI -> materi Voice Cloning.
"""

KATALOG = {
    "scam-online:0": ("Scam & Penipuan Online", "Apa itu Scam Online?"),
    "scam-online:1": ("Scam & Penipuan Online", "Marketplace Scam"),
    "scam-online:2": ("Scam & Penipuan Online", "Giveaway & Hadiah Palsu"),
    "scam-online:3": ("Scam & Penipuan Online", "Job Scam (Lowongan Palsu)"),
    "scam-online:4": ("Scam & Penipuan Online", "Investment & Crypto Scam"),
    "scam-online:5": ("Scam & Penipuan Online", "Romance Scam"),
    "phishing:2": ("Phishing", "WhatsApp Phishing"),
    "phishing:3": ("Phishing", "Smishing & Vishing"),
    "social-engineering:1": ("Social Engineering", "Impersonation"),
    "social-engineering:3": ("Social Engineering", "Scareware"),
    "social-engineering:4": ("Social Engineering", "Pretexting"),
    "mobile-banking:1": ("Mobile Banking Attack", "Fake Banking App"),
    "mobile-banking:2": ("Mobile Banking Attack", "OTP Theft"),
    "mobile-banking:3": ("Mobile Banking Attack", "SIM Swapping"),
    "malware:6": ("Malware", "Malware APK Android"),
    "ai-attack:1": ("AI Cyber Attack", "AI Phishing & AI Chat Scam"),
    "ai-attack:2": ("AI Cyber Attack", "Voice Cloning"),
    "account-takeover:1": ("Account Takeover", "WhatsApp Hijacking"),
    "data-breach:2": ("Data Breach", "Identity Leak (NIK, KTP)"),
    "ecommerce-fraud:1": ("E-Commerce Fraud", "Fake Marketplace & Toko Online Palsu"),
    "qr-code-attack:2": ("QR Code Attack", "QRIS Palsu"),
}

# Cadangan: kategori pola (scam_rules.py) -> materi
DARI_KATEGORI = {
    "minta_data_rahasia": ["mobile-banking:2"],
    "instal_aplikasi_atau_link": ["malware:6"],
    "perintah_transfer": ["phishing:3"],
    "isolasi_korban": ["social-engineering:4"],
    "ancaman": ["social-engineering:1"],
    "iming_iming": ["scam-online:2"],
    "mengaku_pihak_resmi": ["social-engineering:1"],
    "desakan_waktu": ["social-engineering:4"],
    "darurat_keluarga": ["social-engineering:1", "ai-attack:2"],
}

# Urutan kategori yang dipakai untuk memilih materi: yang paling menjelaskan modus lebih dulu
PRIORITAS_KATEGORI = [
    "iming_iming", "minta_data_rahasia", "instal_aplikasi_atau_link", "isolasi_korban",
    "darurat_keluarga", "mengaku_pihak_resmi", "ancaman", "perintah_transfer", "desakan_waktu",
]

KODE_SUARA_AI = "ai-attack:2"
MAKS_MATERI = 3


def daftar_untuk_prompt() -> str:
    """Satu baris per materi, untuk dimasukkan ke prompt Gemini."""
    return "\n".join(f"{kode} = {topik} (materi {judul})" for kode, (judul, topik) in KATALOG.items())


def kode_valid(kode) -> bool:
    return isinstance(kode, str) and kode.strip() in KATALOG


def _detail(kode: str) -> dict:
    judul, topik = KATALOG[kode]
    slug, nomor = kode.split(":")
    return {"kode": kode, "slug": slug, "judul": judul, "topik": topik, "nomor_topik": int(nomor)}


def rekomendasi(kode_llm, temuan_aturan, label_isi, label_suara) -> list:
    """
    kode_llm      : daftar kode pilihan Gemini (boleh kosong/None)
    temuan_aturan : daftar temuan dari analisis_aturan
    label_isi     : "penipuan" | "mencurigakan" | "aman" | None (isi tidak bisa dianalisis)
    label_suara   : "sintetis" | "asli" | None
    """
    kode = []

    def tambah(k):
        if k in KATALOG and k not in kode and len(kode) < MAKS_MATERI:
            kode.append(k)

    if label_isi in ("penipuan", "mencurigakan"):
        for k in (kode_llm or [])[:2]:
            if kode_valid(k):
                tambah(k.strip())
        if not kode:  # Gemini tidak memberi pilihan -> pakai pola aturan
            urut = {k: i for i, k in enumerate(PRIORITAS_KATEGORI)}
            for t in sorted(temuan_aturan or [], key=lambda x: urut.get(x["kategori"], 99)):
                for k in DARI_KATEGORI.get(t["kategori"], []):
                    tambah(k)

    if label_suara == "sintetis":
        tambah(KODE_SUARA_AI)

    return [_detail(k) for k in kode]