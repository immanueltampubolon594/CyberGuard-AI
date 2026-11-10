"""
Tahap 8 - langkah 1: membuat daftar jawaban benar (label_uji.csv) dari folder-folder audio.

Satu folder = satu kelompok audio yang jawaban benarnya sama (mis. semua isi folder "Fraud"
adalah penipuan). Jalankan skrip ini sekali per folder; hasilnya DITAMBAHKAN ke label_uji.csv.
Audio TIDAK disalin; yang dicatat hanya alamat filenya.

Cara pakai (dari folder backend, venv aktif, PowerShell). Ganti PATH dengan alamat folder Anda:

  # suara AI dari naskah, isi penipuan
  python voice\\scripts\\buat_label_uji.py "PATH\\Eleven Labs\\Fraud" --label-isi penipuan --suara sintetis --sumber naskah_ai
  # suara AI dari naskah, isi bukan penipuan
  python voice\\scripts\\buat_label_uji.py "PATH\\Eleven Labs\\No Fraud" --label-isi aman --suara sintetis --sumber naskah_ai
  # suara AI (MMS), isi bukan penipuan
  python voice\\scripts\\buat_label_uji.py "PATH\\mms\\no_fraud" --label-isi aman --suara sintetis --sumber mms
  # suara manusia dari YouTube, isi bukan penipuan
  python voice\\scripts\\buat_label_uji.py "PATH\\Human\\dataset_Purbaya\\No Fraud" --label-isi aman --suara asli --sumber youtube

Pilihan:
  --label-isi  penipuan | aman           jawaban benar untuk isi percakapan
  --suara      asli | sintetis           jawaban benar untuk jenis suara (dipakai untuk pemisahan laporan)
  --sumber     nama bebas, tanpa spasi   mis. naskah_ai, mms, youtube (laporan dipisah per sumber)
  --maks N     ambil paling banyak N file, dipilih merata dari folder (bawaan 30)
  --bagian     dev | uji                 paksa seluruh folder ini masuk data pengembangan (dev) atau
                                         data uji (uji). Kosongkan agar dibagi otomatis 50:50.
  --keluaran   alamat label_uji.csv      bawaan voice\\data_uji\\label_uji.csv (sudah di-gitignore)

Kolom label_uji.csv:
  id, path, label_isi, jenis_suara, sumber, bagian, teks_acuan
Kolom teks_acuan boleh diisi tangan (isi ucapan yang benar) untuk menghitung WER transkripsi;
dikosongkan pun tidak apa-apa. File ini bisa dibuka dan diedit di Excel.
"""

import argparse
import csv
import re
import sys
from pathlib import Path

AKAR = Path(__file__).resolve().parent.parent          # backend/voice
EKSTENSI = {".wav", ".mp3", ".flac", ".m4a", ".ogg", ".opus"}
KOLOM = ["id", "path", "label_isi", "jenis_suara", "sumber", "bagian", "teks_acuan"]


def baca_csv(path: Path) -> list[dict]:
    """Baca CSV; tahan terhadap pemisah koma atau titik koma (Excel berbahasa Indonesia)."""
    if not path.exists():
        return []
    teks = path.read_text(encoding="utf-8-sig")
    baris_pertama = teks.splitlines()[0] if teks.strip() else ""
    pemisah = ";" if baris_pertama.count(";") > baris_pertama.count(",") else ","
    return list(csv.DictReader(teks.splitlines(), delimiter=pemisah))


def tulis_csv(path: Path, baris: list[dict]):
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=KOLOM, extrasaction="ignore")
        w.writeheader()
        for b in baris:
            w.writerow({k: b.get(k, "") or "" for k in KOLOM})


def pilih_merata(daftar, maks):
    if len(daftar) <= maks:
        return daftar
    langkah = len(daftar) / maks
    return [daftar[int(i * langkah)] for i in range(maks)]


def id_unik(sumber: str, stem: str, dipakai: set) -> str:
    dasar = re.sub(r"[^\w.-]", "_", f"{sumber}_{stem}")
    kandidat, n = dasar, 2
    while kandidat in dipakai:
        kandidat = f"{dasar}_{n}"
        n += 1
    return kandidat


def main():
    ap = argparse.ArgumentParser(description="Tambah folder audio ke label_uji.csv")
    ap.add_argument("folder")
    ap.add_argument("--label-isi", required=True, choices=["penipuan", "aman"])
    ap.add_argument("--suara", required=True, choices=["asli", "sintetis"])
    ap.add_argument("--sumber", required=True)
    ap.add_argument("--maks", type=int, default=30)
    ap.add_argument("--bagian", choices=["dev", "uji"], default="")
    ap.add_argument("--keluaran", default=str(AKAR / "data_uji" / "label_uji.csv"))
    a = ap.parse_args()

    folder = Path(a.folder)
    if not folder.is_dir():
        sys.exit(f"Folder tidak ditemukan: {folder}")
    semua = sorted(p for p in folder.iterdir() if p.is_file() and p.suffix.lower() in EKSTENSI)
    if not semua:
        sys.exit("Tidak ada file audio (wav, mp3, flac, m4a, ogg, opus) di folder itu.")

    tujuan = Path(a.keluaran)
    baris = baca_csv(tujuan)
    sudah_path = {b["path"] for b in baris}
    sudah_id = {b["id"] for b in baris}

    terpilih = pilih_merata(semua, a.maks)
    baru = 0
    for p in terpilih:
        alamat = str(p.resolve())
        if alamat in sudah_path:
            continue
        i = id_unik(a.sumber, p.stem, sudah_id)
        sudah_id.add(i)
        baris.append({
            "id": i, "path": alamat, "label_isi": a.label_isi, "jenis_suara": a.suara,
            "sumber": a.sumber, "bagian": a.bagian, "teks_acuan": "",
        })
        baru += 1

    tulis_csv(tujuan, baris)
    print(f"Folder   : {folder}")
    print(f"Ditemukan: {len(semua)} file | dipilih: {len(terpilih)} | ditambahkan baru: {baru}")
    print(f"Disimpan : {tujuan}  (total {len(baris)} baris)")

    ringkas = {}
    for b in baris:
        k = (b["label_isi"], b["jenis_suara"], b["sumber"])
        ringkas[k] = ringkas.get(k, 0) + 1
    print("\nIsi label_uji.csv sekarang:")
    for (li, js, sm), n in sorted(ringkas.items()):
        print(f"  isi={li:<9} suara={js:<9} sumber={sm:<12} : {n} file")


if __name__ == "__main__":
    main()