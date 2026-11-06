"""
Ukur seberapa sering deteksi suara (XLS-R + AASIST) salah menilai SATU FOLDER rekaman.

Kegunaan: menjawab "apakah salahnya di model suara?" dengan angka, bukan dugaan satu file.
Semua file di satu folder dianggap punya jawaban benar yang sama (--label).

Cara pakai (dari folder backend, venv aktif, PowerShell):
  # folder suara manusia asli (jawaban benar = asli)
  python voice\\scripts\\uji_suara_folder.py "D:\\PRAKTIKUM\\Dataset Audio\\Human\\dataset_jokowi\\No Fraud" --label asli
  # folder suara buatan AI (jawaban benar = sintetis)
  python voice\\scripts\\uji_suara_folder.py "D:\\...\\folder_suara_ai" --label sintetis

Pilihan:
  --maks N   periksa paling banyak N file, dipilih merata dari seluruh folder (bawaan 40)

Hasil: tabel per file di layar + ringkasan, dan CSV di
  voice\\results\\uji_lokal\\skor_per_klip_<nama folder>.csv   (sudah di-gitignore)
Tidak memakai internet, Groq, atau Gemini. Hanya membaca model suara milik tim.
"""

import argparse
import csv
import statistics
import sys
from pathlib import Path

AKAR = Path(__file__).resolve().parent.parent          # backend/voice
sys.path.insert(0, str(AKAR / "src"))

from authenticity import PendeteksiKeaslian  # noqa: E402

EKSTENSI = {".wav", ".mp3", ".flac", ".m4a", ".ogg", ".opus"}
AMBANG_COBA = [0.3, 0.5, 0.7]


def pilih_merata(files, maks):
    if len(files) <= maks:
        return files
    langkah = len(files) / maks
    return [files[int(i * langkah)] for i in range(maks)]


def main():
    ap = argparse.ArgumentParser(description="Uji deteksi suara pada satu folder.")
    ap.add_argument("folder")
    ap.add_argument("--label", required=True, choices=["asli", "sintetis"],
                    help="jawaban benar untuk semua file di folder ini")
    ap.add_argument("--maks", type=int, default=40)
    a = ap.parse_args()

    folder = Path(a.folder)
    if not folder.is_dir():
        sys.exit(f"Folder tidak ditemukan: {folder}")
    semua = sorted(p for p in folder.iterdir() if p.suffix.lower() in EKSTENSI)
    if not semua:
        sys.exit("Tidak ada file audio (wav, mp3, flac, m4a, ogg, opus) di folder itu.")
    files = pilih_merata(semua, a.maks)
    print(f"Folder: {folder}\nJawaban benar: {a.label} | diperiksa {len(files)} dari {len(semua)} file\n")

    pendeteksi = PendeteksiKeaslian(folder_model=AKAR / "models")
    ambang = pendeteksi.ambang
    baris, gagal = [], 0
    for i, f in enumerate(files, 1):
        try:
            h = pendeteksi.periksa(f)
        except Exception as e:                         # satu file rusak tidak menghentikan semuanya
            gagal += 1
            print(f"[{i:>3}/{len(files)}] {f.name:<32} GAGAL dibaca ({type(e).__name__})")
            continue
        benar = h["label"] == a.label
        baris.append({"file": f.name, "skor_asli": h["skor_asli"], "label": h["label"],
                      "benar": benar, "jumlah_segmen": h["jumlah_segmen"]})
        print(f"[{i:>3}/{len(files)}] {f.name:<32} skor_asli={h['skor_asli']:.4f}  ->  {h['label']:<8} "
              f"{'ok' if benar else 'SALAH'}  ({h['jumlah_segmen']} segmen)")

    if not baris:
        sys.exit("Tidak ada file yang berhasil diperiksa.")

    skor = [b["skor_asli"] for b in baris]
    salah = [b for b in baris if not b["benar"]]
    print("\n===== RINGKASAN =====")
    print(f"Diperiksa: {len(baris)} file (gagal dibaca: {gagal})")
    print(f"Salah dinilai: {len(salah)} file = {100 * len(salah) / len(baris):.1f}%   (ambang sekarang {ambang:.4f})")
    print(f"Skor asli: terendah {min(skor):.3f} | tengah {statistics.median(skor):.3f} | tertinggi {max(skor):.3f}")
    nama_salah = "suara manusia dikira AI" if a.label == "asli" else "suara AI lolos dikira asli"
    print(f"Jenis kesalahan: {nama_salah}")

    print("\nBila ambang diganti (skor tinggi = asli), kesalahan pada folder ini menjadi:")
    for t in sorted(set(AMBANG_COBA + [round(ambang, 4)])):
        if a.label == "asli":
            n = sum(1 for s in skor if s < t)          # asli yang ditolak
        else:
            n = sum(1 for s in skor if s >= t)         # sintetis yang lolos
        print(f"  ambang {t:<6} -> salah {n:>3} dari {len(skor)} ({100 * n / len(skor):.1f}%)")
    print("Catatan: menurunkan ambang mengurangi suara manusia yang salah dituduh AI, tetapi menambah suara AI yang lolos.\n"
          "         Jalankan juga pada folder suara AI (--label sintetis) sebelum memutuskan ambang.")

    keluar = AKAR / "results" / "uji_lokal"
    keluar.mkdir(parents=True, exist_ok=True)
    nama = "".join(c if c.isalnum() or c in "-_" else "_" for c in folder.parent.name + "_" + folder.name)
    csv_path = keluar / f"skor_per_klip_{nama}.csv"
    with open(csv_path, "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=list(baris[0].keys()))
        w.writeheader()
        w.writerows(baris)
    print(f"CSV disimpan: {csv_path}")


if __name__ == "__main__":
    main()