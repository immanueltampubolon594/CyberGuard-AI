# Endpoint suara:
#   POST /voice/check   -> hanya deteksi suara asli/sintetis (XLS-R 300M beku + AASIST)
#   POST /voice/analyze -> alur lengkap: deteksi suara + transkripsi + analisis isi (penipuan atau bukan)
import os
import sys
import tempfile
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile

from services.audio.scam_analyzer import AnalisisAudioError, analisis_audio

# Folder backend/voice (berisi src/ dan models/)
AKAR_VOICE = Path(__file__).resolve().parent.parent / "voice"
sys.path.insert(0, str(AKAR_VOICE / "src"))

router = APIRouter(prefix="/voice", tags=["Voice Authenticity"])

EKSTENSI_BOLEH = {".wav", ".mp3", ".flac", ".m4a", ".ogg", ".opus"}
UKURAN_MAKS_MB = 25

_pendeteksi = None


def _ambil_pendeteksi():
    # Model dimuat sekali saja, saat permintaan pertama
    global _pendeteksi
    if _pendeteksi is None:
        from authenticity import PendeteksiKeaslian
        _pendeteksi = PendeteksiKeaslian(folder_model=AKAR_VOICE / "models")
    return _pendeteksi


def _simpan_sementara(file: UploadFile) -> str:
    """Validasi format + ukuran, lalu simpan ke file sementara. Kembalikan path-nya."""
    ekstensi = Path(file.filename or "").suffix.lower()
    if ekstensi not in EKSTENSI_BOLEH:
        raise HTTPException(
            status_code=400,
            detail="Format tidak didukung. Gunakan WAV, MP3, FLAC, M4A, OGG, atau OPUS.",
        )

    isi = file.file.read()
    if len(isi) > UKURAN_MAKS_MB * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail=f"Ukuran file maksimal {UKURAN_MAKS_MB} MB.",
        )

    with tempfile.NamedTemporaryFile(delete=False, suffix=ekstensi) as tmp:
        tmp.write(isi)
        return tmp.name


@router.post("/check")
def periksa_suara(file: UploadFile = File(...)):
    path_sementara = None
    try:
        path_sementara = _simpan_sementara(file)
        hasil = _ambil_pendeteksi().periksa(path_sementara)
        return {"success": True, "hasil": hasil}

    except HTTPException:
        raise
    except Exception as e:
        print(f"Voice Error: {e}")
        raise HTTPException(status_code=500, detail=f"Gagal memeriksa suara: {e}")

    finally:
        if path_sementara and os.path.exists(path_sementara):
            os.remove(path_sementara)


@router.post("/analyze")
def analisis_suara(file: UploadFile = File(...)):
    """Alur lengkap satu kali upload. Bentuk balasan sama dengan /voice/check
    ({"success": True, "hasil": {...}}), isi "hasil" ada di services/audio/scam_analyzer.py."""
    path_sementara = None
    try:
        path_sementara = _simpan_sementara(file)

        # lambda: kalau model suara gagal dimuat, itu dianggap "deteksi suara gagal"
        # (hasil isi percakapan tetap keluar), bukan membuat seluruh permintaan error
        hasil = analisis_audio(
            path_sementara,
            periksa_suara=lambda p: _ambil_pendeteksi().periksa(p),
        )
        return {"success": True, "hasil": hasil}

    except HTTPException:
        raise
    except AnalisisAudioError as e:
        # pesan sudah ramah pengguna (mis. audio terlalu panjang, tidak terbaca, kuota habis)
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        # detail teknis hanya di log server, tidak dikirim ke pengguna
        print(f"Voice Analyze Error: {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail="Gagal menganalisis audio. Coba lagi beberapa saat lagi.")

    finally:
        if path_sementara and os.path.exists(path_sementara):
            os.remove(path_sementara)