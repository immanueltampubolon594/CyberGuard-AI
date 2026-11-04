"""
Uji Tahap 2: transkripsi satu atau beberapa file audio dengan Groq Whisper.

Cara pakai (dari folder backend, venv aktif):
  python voice\\scripts\\uji_transkripsi.py voice\\data_uji\\penipuan_01.m4a
  python voice\\scripts\\uji_transkripsi.py voice\\data_uji\\*.m4a --model whisper-large-v3
  python voice\\scripts\\uji_transkripsi.py voice\\data_uji\\penipuan_01.m4a --aturan
  python voice\\scripts\\uji_transkripsi.py voice\\data_uji\\penipuan_01.m4a --aturan --llm

Hasil ditampilkan di terminal dan disimpan ke:
  voice/results/transkrip/<model>/<nama_file>.json
"""

import argparse
import glob
import json
import sys
from pathlib import Path

# Agar "services" bisa di-import saat skrip dijalankan dari folder mana pun
AKAR_BACKEND = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(AKAR_BACKEND))

from services.audio.transcriber import MODEL_DEFAULT, TranskripsiError, transkripsi  # noqa: E402
from services.audio.scam_rules import analisis_aturan  # noqa: E402
from services.audio.scam_llm import AnalisisLLMError, analisis_llm  # noqa: E402


def main():
    parser = argparse.ArgumentParser(description="Uji transkripsi Groq Whisper")
    parser.add_argument("file", nargs="+", help="file audio (boleh pakai *.m4a)")
    parser.add_argument("--model", default=MODEL_DEFAULT,
                        help="whisper-large-v3-turbo (default) atau whisper-large-v3")
    parser.add_argument("--aturan", action="store_true",
                        help="sekalian jalankan aturan pola penipuan (tahap 3)")
    parser.add_argument("--llm", action="store_true",
                        help="sekalian jalankan analisis Gemini (tahap 4)")
    args = parser.parse_args()

    # Windows tidak mengembangkan *.m4a otomatis, jadi dikembangkan di sini
    daftar = []
    for pola in args.file:
        cocok = glob.glob(pola)
        daftar.extend(cocok if cocok else [pola])

    folder_hasil = AKAR_BACKEND / "voice" / "results" / "transkrip" / args.model
    folder_hasil.mkdir(parents=True, exist_ok=True)

    for path in daftar:
        print("=" * 70)
        print(f"File  : {path}")
        try:
            hasil = transkripsi(path, model=args.model)
        except TranskripsiError as e:
            print(f"GAGAL : {e}")
            continue

        print(f"Model : {hasil['model']}")
        print(f"Durasi: {hasil['durasi_detik']} detik | proses {hasil['waktu_proses_detik']} detik"
              f" | potongan ragu: {hasil['jumlah_ragu']}")
        print("-" * 70)
        for p in hasil["potongan"]:
            tanda = " [RAGU]" if p["ragu"] else ""
            print(f"[{p['mulai']:>6.1f}s] {p['teks']}{tanda}")
        print("-" * 70)
        print("TEKS LENGKAP:")
        print(hasil["teks"])

        if args.aturan:
            a = analisis_aturan(hasil)
            print("-" * 70)
            print(f"ATURAN POLA PENIPUAN: {a['label'].upper()} (skor {a['skor']})")
            for t in a["temuan"]:
                waktu = f"[{t['mulai']:.1f}s] " if t["mulai"] is not None else ""
                print(f"  +{t['bobot']:>2} {t['deskripsi']}")
                print(f"      {waktu}\"{t['kutipan']}\"")
            hasil["aturan"] = a

        if args.llm:
            print("-" * 70)
            try:
                g = analisis_llm(hasil)
            except AnalisisLLMError as e:
                print(f"ANALISIS GEMINI GAGAL: {e}")
            else:
                print(f"ANALISIS GEMINI: {g['label'].upper()} (skor {g['skor']}) "
                      f"| proses {g['waktu_proses_detik']} detik")
                print(f"  Modus : {g['modus']}")
                print(f"  Alasan: {g['alasan']}")
                for b in g["bukti"]:
                    waktu = f"[{b['mulai']:.1f}s] " if b["mulai"] is not None else ""
                    print(f"  Bukti : {waktu}\"{b['kutipan']}\"")
                if g["bukti_dibuang"]:
                    print(f"  ({g['bukti_dibuang']} kutipan dibuang karena tidak ada di transkrip)")
                print(f"  Saran : {g['saran']}")
                hasil["llm"] = g

        tujuan = folder_hasil / (Path(path).stem + ".json")
        tujuan.write_text(json.dumps(hasil, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"Disimpan: {tujuan}")


if __name__ == "__main__":
    main()