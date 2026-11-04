"""
Tugas B - Tahap 3: Aturan pola penipuan (rule-based)

Membaca transkrip, mencari indikator penipuan yang umum di telepon penipuan
Indonesia, lalu memberi skor 0-100 beserta kutipan bukti dan waktunya.

Kenapa pakai aturan (selain LLM)?
  - Hasilnya bisa dijelaskan: setiap poin skor punya alasan dan kutipan.
  - Tidak butuh internet atau kuota.
  - Menjadi pembanding saat evaluasi (aturan saja vs LLM vs gabungan).

Kategori dan bobot disusun dari modus yang dibahas di materi Pembelajaran
(social engineering, mobile banking, account takeover, scam online).
"""

import re

# ── Daftar indikator ─────────────────────────────────────────────
# bobot  : sumbangan ke skor (setiap kategori dihitung sekali)
# kritis : jika ditemukan, minimal berlabel "mencurigakan"

INDIKATOR = [
    {
        "kategori": "minta_data_rahasia",
        "deskripsi": "Meminta kode OTP, PIN, password, atau data kartu",
        "bobot": 35,
        "kritis": True,
        "pola": [
            r"\botp\b", r"kode verifikasi", r"kode (yang )?(masuk|dari sms|enam digit|6 digit)",
            r"\bsms berisi kode\b", r"bacakan (ke|kepada) saya", r"\bpin\b", r"password", r"kata sandi",
            r"\bcvv\b", r"nomor kartu", r"tanggal berlaku", r"masa berlaku",
        ],
    },
    {
        "kategori": "instal_aplikasi_atau_link",
        "deskripsi": "Menyuruh memasang aplikasi/APK, membuka link, atau memberi izin akses",
        "bobot": 25,
        "kritis": True,
        "pola": [
            r"\binstal", r"\binstall", r"\bapk\b", r"klik (link|tautan)", r"buka (link|tautan|filenya)",
            r"(link|tautan) yang saya kirim", r"izin(kan)? akses", r"pilih izinkan", r"formulir di (link|tautan)",
        ],
    },
    {
        "kategori": "perintah_transfer",
        "deskripsi": "Meminta transfer, deposit, atau pembayaran di muka",
        "bobot": 25,
        "kritis": False,
        "pola": [
            r"\btransfer\b", r"kirim uang", r"\bdeposit\b", r"bayar (dulu|pajak|biaya)", r"wajib bayar",
            r"uang damai", r"rekening (pribadi|teman|panitia|admin|yang saya kirim)", r"\bmodal\b",
        ],
    },
    {
        "kategori": "isolasi_korban",
        "deskripsi": "Menyuruh merahasiakan atau tidak menghubungi orang lain",
        "bobot": 25,
        "kritis": True,
        "pola": [
            r"jangan (bilang|beri tahu|beritahu|kasih tahu|kabari)", r"\brahasia(kan)?\b",
            r"jangan matikan telepon", r"orang lain tahu",
        ],
    },
    {
        "kategori": "ancaman",
        "deskripsi": "Mengancam: blokir, hangus, ditangkap, data disebar",
        "bobot": 15,
        "kritis": False,
        "pola": [
            r"\b(di|ter)?blokir\b", r"\bhangus\b", r"ditangkap", r"kami amankan", r"pengadilan",
            r"(kasus|kasusnya) (bisa )?(naik|kami lanjutkan|dilanjutkan)", r"(sebar|disebar)",
            r"datangi", r"\bdenda\b", r"dana .{0,20}hilang", r"bawa balik", r"dikenai biaya",
            r"tidak bisa ditarik",
        ],
    },
    {
        "kategori": "iming_iming",
        "deskripsi": "Iming-iming hadiah atau keuntungan tidak wajar",
        "bobot": 15,
        "kritis": False,
        "pola": [
            r"\bhadiah\b", r"\bundian\b", r"\bpemenang\b", r"keuntungan pasti", r"untung (pasti|besar)",
            r"tanpa risiko", r"(modal|dana) dijamin", r"\bcashback\b", r"(\d+|[a-z]+ puluh) persen (setiap|per) minggu",
            r"dibayar .{0,25}per tugas",
        ],
    },
    {
        "kategori": "mengaku_pihak_resmi",
        "deskripsi": "Mengaku dari bank, polisi, operator, kurir, atau lembaga",
        "bobot": 10,
        "kritis": False,
        "pola": [
            r"saya .{0,25}dari (bank|layanan|pusat|bagian|polsek|polres|operator|agensi|komunitas)",
            r"layanan (nasabah|pelanggan)", r"petugas resmi", r"\b(bripka|brigadir|polsek|polres)\b",
            r"\bojk\b", r"bagian penagihan", r"saya kurir", r"saya mentor",
        ],
    },
    {
        "kategori": "desakan_waktu",
        "deskripsi": "Mendesak harus dilakukan saat itu juga",
        "bobot": 10,
        "kritis": False,
        "pola": [
            r"sekarang juga", r"\bsegera\b", r"hari ini (juga|terakhir)", r"malam ini( juga)?",
            r"(dalam|cuma|hanya) (satu|dua|lima|\d+) (menit|jam)", r"berlaku (satu|dua|lima|\d+) menit",
            r"\bcepat(an)?\b", r"jam (lima|\d+) sore ini", r"kuotanya tinggal", r"transfer sekarang",
            r"(proses|bantu prosesnya) sekarang", r"dikonfirmasi sekarang",
        ],
    },
    {
        "kategori": "darurat_keluarga",
        "deskripsi": "Mengaku keluarga dalam keadaan darurat / ganti nomor",
        "bobot": 10,
        "kritis": False,
        "pola": [
            r"ganti nomor", r"pakai nomor teman", r"\bhp(nya|-?ku)? (jatuh|rusak|mati|hilang)",
            r"(kecelakaan|rumah sakit)",
        ],
    },
]

# Kalimat yang berisi kata-kata ini dianggap PERINGATAN atau CERITA, bukan permintaan.
# Indikator di kalimat tersebut tidak dihitung (mengurangi salah tuduh / false positive).
POLA_KONTEKS_AMAN = [
    r"tidak akan pernah (meminta|minta)", r"jangan (pernah )?(berikan|kasih|bagikan)",
    r"(itu|pasti) penipuan", r"kena tipu", r"\bpenipu\b", r"\bkatanya\b", r"\bngaku\b",
    r"contoh modus", r"\bmakalah\b", r"\bmateri\b", r"\blapor\b", r"hati-hati",
    r"aplikasi resmi", r"nomor resmi", r"aplikasi marketplace", r"aplikasi pelacakan ya",
]

AMBANG_PENIPUAN = 60
AMBANG_MENCURIGAKAN = 30


# ── Pembantu ─────────────────────────────────────────────────────

def normalisasi(teks: str) -> str:
    """Huruf kecil, ejaan tidak baku disamakan, tanda baca dibuang."""
    t = teks.lower()
    t = re.sub(r"\bo\s*\.?\s*t\s*\.?\s*p\b", "otp", t)     # "o t p", "o.t.p"
    t = re.sub(r"\bo?tepe\b|\botepe\b|\bo te pe\b", "otp", t)
    t = re.sub(r"\bpe\s*i\s*en\b", "pin", t)
    t = t.replace("whatsapp", "wa").replace("what's app", "wa")
    t = re.sub(r"[^\w\s%-]", " ", t)
    return re.sub(r"\s+", " ", t).strip()


def _pecah_kalimat(transkrip) -> list[dict]:
    """
    Terima hasil transcriber (dict berisi 'potongan') ATAU teks biasa.
    Kembalikan daftar {teks, mulai}.
    """
    if isinstance(transkrip, dict) and transkrip.get("potongan"):
        return [
            {"teks": p["teks"], "mulai": p.get("mulai")}
            for p in transkrip["potongan"] if not p.get("bukan_suara")
        ]
    teks = transkrip["teks"] if isinstance(transkrip, dict) else str(transkrip)
    bagian = re.split(r"(?<=[.!?])\s+|\n+", teks)
    return [{"teks": b.strip(), "mulai": None} for b in bagian if b.strip()]


# ── Fungsi utama ─────────────────────────────────────────────────

def analisis_aturan(transkrip) -> dict:
    """
    Kembalikan:
    {
      "skor": 0-100,
      "label": "penipuan" | "mencurigakan" | "aman",
      "temuan": [{"kategori", "deskripsi", "bobot", "kutipan", "mulai"}],
      "kategori_terdeteksi": [...],
      "ada_indikator_kritis": bool
    }
    """
    kalimat = _pecah_kalimat(transkrip)
    temuan = {}  # kategori -> temuan pertama (satu kategori dihitung sekali)

    for k in kalimat:
        norm = normalisasi(k["teks"])
        if any(re.search(p, norm) for p in POLA_KONTEKS_AMAN):
            continue
        for ind in INDIKATOR:
            if ind["kategori"] in temuan:
                continue
            if any(re.search(p, norm) for p in ind["pola"]):
                temuan[ind["kategori"]] = {
                    "kategori": ind["kategori"],
                    "deskripsi": ind["deskripsi"],
                    "bobot": ind["bobot"],
                    "kutipan": k["teks"],
                    "mulai": k["mulai"],
                }

    skor = min(100, sum(t["bobot"] for t in temuan.values()))
    kritis = any(
        ind["kritis"] and ind["kategori"] in temuan for ind in INDIKATOR
    )

    if skor >= AMBANG_PENIPUAN:
        label = "penipuan"
    elif skor >= AMBANG_MENCURIGAKAN or kritis:
        label = "mencurigakan"
    else:
        label = "aman"

    # Urutkan sesuai urutan kemunculan di audio
    daftar = sorted(temuan.values(), key=lambda t: (t["mulai"] is None, t["mulai"] or 0))
    return {
        "skor": skor,
        "label": label,
        "temuan": daftar,
        "kategori_terdeteksi": [t["kategori"] for t in daftar],
        "ada_indikator_kritis": kritis,
    }