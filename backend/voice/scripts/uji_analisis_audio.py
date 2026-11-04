"""
Uji Tahap 5: jalankan SELURUH alur untuk satu atau beberapa audio
  deteksi suara (AI/manusia) -> transkripsi -> aturan -> Gemini -> kesimpulan

Cara pakai (dari folder backend, venv aktif):
  python voice\\scripts\\uji_analisis_audio.py voice\\data_uji\\ELF002.mp3 voice\\data_uji\\ELN001.mp3
  python voice\\scripts\\uji_analisis_audio.py voice\\data_uji\\ELF002.mp3 --tanpa-suara

Catatan: model deteksi suara (XLS-R) dimuat sekali di awal, jadi proses pertama
agak lama. Pilihan --tanpa-suara melewati deteksi suara.

Hasil lengkap disimpan ke voice/results/analisis_audio/<nama_file>.json
"""

import argparse
import glob
import json
import sys
from pathlib import Path

AKAR_BACKEND = Path(__file__).resolve().parents[2]
AKAR_VOICE = AKAR_BACKEND / "voice"
sys.path.insert(0, str(AKAR_BACKEND))
sys.path.insert(0, str(AKAR_VOICE / "src"))

from services.audio.scam_analyzer import AnalisisAudioError, analisis_audio  # noqa: E402


def main():
    parser = argparse.ArgumentParser(description="Uji alur analisis audio lengkap")
    parser.add_argument("file", nargs="+", help="file audio (boleh pakai *.mp3)")
    parser.add_argument("--tanpa-suara", action="store_true", help="lewati deteksi AI/manusia")
    args = parser.parse_args()

    periksa_suara = None
    if not args.tanpa_suara:
        print("Memuat model deteksi suara (XLS-R + AASIST)...")
        from authenticity import PendeteksiKeaslian
        periksa_suara = PendeteksiKeaslian(folder_model=AKAR_VOICE / "models").periksa

    daftar = []
    for pola in args.file:
        cocok = glob.glob(pola)
        daftar.extend(cocok if cocok else [pola])

    folder_hasil = AKAR_VOICE / "results" / "analisis_audio"
    folder_hasil.mkdir(parents=True, exist_ok=True)

    for path in daftar:
        print("=" * 70)
        print(f"File : {path}")
        try:
            h = analisis_audio(path, periksa_suara=periksa_suara)
        except AnalisisAudioError as e:
            print(f"GAGAL: {e}")
            continue

        s, i = h["suara"], h["isi"]
        print(f"TINGKAT RISIKO : {h['tingkat_risiko'].upper()}")
        print(f"Ringkasan      : {h['ringkasan']}")
        print("-" * 70)
        if s["tersedia"]:
            print(f"Suara : {s['label'].upper()} (skor asli {s['skor_asli']}, ambang {s['ambang']}, "
                  f"{s['jumlah_segmen']} segmen)")
        else:
            print(f"Suara : {s.get('error') or 'dilewati (--tanpa-suara)'}")
        if i["tersedia"]:
            print(f"Isi   : {i['label'].upper()} (skor {i['skor']}; aturan {i['skor_aturan']}, "
                  f"Gemini {i['skor_llm']}) - {i['metode']}")
            print(f"Modus : {i['modus']}")
            for b in i["bukti"]:
                w = f"[{b['mulai']:.1f}s] " if b["mulai"] is not None else ""
                print(f"Bukti : {w}\"{b['kutipan']}\" ({b['sumber']})")
        else:
            print(f"Isi   : tidak tersedia ({i.get('error', '')})")
        print(f"Saran : {h['saran']}")
        for c in h["catatan"]:
            print(f"Catatan: {c}")
        print(f"Waktu : {h['waktu_proses_detik']} detik")

        tujuan = folder_hasil / (Path(path).stem + ".json")
        tujuan.write_text(json.dumps(h, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"Disimpan: {tujuan}")


if __name__ == "__main__":
    main()