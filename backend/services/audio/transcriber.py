"""
Tugas B - Tahap 2: Transkripsi audio -> teks (Groq Whisper)

Alur:
  audio (wav/mp3/m4a/ogg/...) -> 16 kHz mono FLAC -> Groq Whisper -> teks + potongan berwaktu

Kenapa diubah ke 16 kHz mono FLAC dulu?
  Whisper memang bekerja di 16 kHz mono. Mengubahnya sendiri membuat file
  jauh lebih kecil (batas paket gratis Groq 25 MB) tanpa menurunkan kualitas.

Kebutuhan:
  - GROQ_API_KEY di backend/.env
  - library: groq, librosa, soundfile, numpy (sudah ada di requirements.txt)
"""

import os
import tempfile
import time
from pathlib import Path

import librosa
import numpy as np
import soundfile as sf
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

# ── Pengaturan ───────────────────────────────────────────────────

MODEL_DEFAULT = "whisper-large-v3-turbo"   # alternatif: "whisper-large-v3"
SAMPLE_RATE = 16000
DURASI_MAKS_DETIK = 600                    # 10 menit
UKURAN_MAKS_MB = 24                        # batas Groq gratis 25 MB, sisakan cadangan

# Kosakata yang sering muncul di telepon penipuan, agar Whisper menulisnya dengan benar.
# Batas prompt Groq: 224 token, jadi dibuat singkat.
PROMPT_KOSAKATA = (
    "Percakapan telepon berbahasa Indonesia. Istilah: OTP, kode verifikasi, PIN, "
    "m-banking, BCA, BRI, BNI, Mandiri, BSI, QRIS, transfer, rekening, OJK, "
    "kurir, paket, APK, WhatsApp, polisi, hadiah, undian, pinjol."
)

# Ambang penanda potongan yang meragukan (berdasarkan panduan Groq)
AMBANG_LOGPROB_RAGU = -0.5      # keyakinan rendah jika avg_logprob <= -0.5
AMBANG_BUKAN_SUARA = 0.8        # kemungkinan besar hening/bukan ucapan jika no_speech_prob >= 0.8


class TranskripsiError(Exception):
    """Error dengan pesan yang aman ditampilkan ke pengguna."""


# ── Klien Groq (dibuat sekali) ───────────────────────────────────

_klien = None


def _ambil_klien() -> Groq:
    global _klien
    if _klien is None:
        key = os.getenv("GROQ_API_KEY")
        if not key:
            raise TranskripsiError("GROQ_API_KEY belum diatur di backend/.env.")
        _klien = Groq(api_key=key)
    return _klien


# ── 1. Siapkan audio ─────────────────────────────────────────────

def siapkan_audio(path_audio) -> tuple[str, float]:
    """
    Baca audio -> 16 kHz mono -> simpan sebagai FLAC sementara.
    Mengembalikan (path_flac, durasi_detik). File FLAC wajib dihapus pemanggil.
    """
    try:
        # Baca sedikit lebih dari batas agar bisa tahu kalau audionya terlalu panjang
        y, _ = librosa.load(
            str(path_audio), sr=SAMPLE_RATE, mono=True, duration=DURASI_MAKS_DETIK + 1
        )
    except Exception as e:
        raise TranskripsiError(f"Audio tidak bisa dibaca: {e}")

    if y.size == 0 or float(np.max(np.abs(y))) < 1e-6:
        raise TranskripsiError("Audio kosong atau hening total.")

    durasi = len(y) / SAMPLE_RATE
    if durasi > DURASI_MAKS_DETIK:
        raise TranskripsiError(
            f"Audio terlalu panjang. Maksimal {DURASI_MAKS_DETIK // 60} menit."
        )

    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".flac")
    tmp.close()
    sf.write(tmp.name, y, SAMPLE_RATE, format="FLAC")

    ukuran_mb = os.path.getsize(tmp.name) / (1024 * 1024)
    if ukuran_mb > UKURAN_MAKS_MB:
        os.remove(tmp.name)
        raise TranskripsiError("Audio terlalu besar setelah dikompres. Coba potong audionya.")

    return tmp.name, round(durasi, 2)


# ── 2. Kirim ke Groq ─────────────────────────────────────────────

def _ke_dict(hasil) -> dict:
    """Ubah objek hasil SDK Groq menjadi dict biasa."""
    if isinstance(hasil, dict):
        return hasil
    if hasattr(hasil, "model_dump"):
        return hasil.model_dump()
    return dict(hasil)


def transkripsi(path_audio, model: str = MODEL_DEFAULT) -> dict:
    """
    Transkripsi satu file audio.

    Mengembalikan:
    {
      "teks": "teks lengkap (tanpa potongan yang kemungkinan bukan ucapan)",
      "potongan": [{"mulai": 0.0, "selesai": 4.2, "teks": "...", "ragu": False}, ...],
      "durasi_detik": 63.5,
      "model": "whisper-large-v3-turbo",
      "waktu_proses_detik": 1.8,
      "jumlah_ragu": 1
    }
    """
    path_flac, durasi = siapkan_audio(path_audio)
    mulai_proses = time.perf_counter()

    try:
        with open(path_flac, "rb") as f:
            hasil = _ambil_klien().audio.transcriptions.create(
                file=(Path(path_flac).name, f.read()),
                model=model,
                language="id",
                prompt=PROMPT_KOSAKATA,
                response_format="verbose_json",
                temperature=0.0,
            )
    except TranskripsiError:
        raise
    except Exception as e:
        # Ubah error teknis menjadi pesan yang mudah dipahami
        nama = type(e).__name__
        if "RateLimit" in nama:
            raise TranskripsiError("Kuota Groq sedang habis. Coba lagi beberapa saat lagi.")
        if "Authentication" in nama:
            raise TranskripsiError("GROQ_API_KEY tidak valid.")
        if "Connection" in nama or "Timeout" in nama:
            raise TranskripsiError("Tidak dapat terhubung ke Groq. Periksa koneksi internet.")
        raise TranskripsiError(f"Transkripsi gagal ({nama}).")
    finally:
        if os.path.exists(path_flac):
            os.remove(path_flac)

    data = _ke_dict(hasil)
    potongan = []
    for s in data.get("segments") or []:
        teks = (s.get("text") or "").strip()
        if not teks:
            continue
        bukan_suara = (s.get("no_speech_prob") or 0) >= AMBANG_BUKAN_SUARA
        ragu = bukan_suara or (s.get("avg_logprob") or 0) <= AMBANG_LOGPROB_RAGU
        potongan.append({
            "mulai": round(float(s.get("start", 0)), 1),
            "selesai": round(float(s.get("end", 0)), 1),
            "teks": teks,
            "ragu": ragu,
            "bukan_suara": bukan_suara,
        })

    # Teks lengkap: buang potongan yang kemungkinan besar bukan ucapan
    # (Whisper kadang "mengarang" kalimat di bagian hening/bising).
    if potongan:
        teks_lengkap = " ".join(p["teks"] for p in potongan if not p["bukan_suara"])
    else:
        teks_lengkap = (data.get("text") or "").strip()

    return {
        "teks": teks_lengkap,
        "potongan": potongan,
        "durasi_detik": durasi,
        "model": model,
        "waktu_proses_detik": round(time.perf_counter() - mulai_proses, 2),
        "jumlah_ragu": sum(1 for p in potongan if p["ragu"]),
    }