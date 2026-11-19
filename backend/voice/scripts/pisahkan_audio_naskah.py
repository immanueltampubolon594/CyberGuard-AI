"""
Memisahkan rekaman manusia menjadi PENIPUAN / BUKAN PENIPUAN berdasarkan NASKAH yang dibacakan,
sekaligus menghitung WER transkripsi.

Label TIDAK diambil dari Gemini. Label diambil dari kode naskah:
  [F001], [F002], ...  = naskah Formal        -> bukan_penipuan
  [I001], [I002], ...  = naskah Impersonation -> penipuan

Cara pakai (PowerShell, dari folder backend, venv aktif):
  python voice\\scripts\\pisahkan_audio_naskah.py voice\\data_uji\\manusia_baru

Hasil (disimpan di folder audio yang sama):
  hasil_pemisahan.txt  -> ringkasan mudah dibaca: nama file + penipuan / bukan penipuan
  hasil_pemisahan.csv  -> tabel lengkap (transkrip, naskah, kemiripan, WER)
Transkrip disimpan di voice\\results\\transkrip\\naskah_<nama_folder>\\ (di-gitignore) supaya
menjalankan ulang TIDAK memakai kuota Groq lagi.

Pilihan:
  --naskah PATH   file naskah (bawaan: satu-satunya file .txt di folder audio)
  --jeda S        jeda S detik antar panggilan Groq (bawaan 3)
"""
import argparse
import csv
import json
import re
import statistics
import sys
import time
from difflib import SequenceMatcher
from pathlib import Path

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

AKAR_BACKEND = Path(__file__).resolve().parents[2]
AKAR_VOICE = AKAR_BACKEND / "voice"
sys.path.insert(0, str(AKAR_BACKEND))

from services.audio.transcriber import transkripsi  # noqa: E402

EKSTENSI = {".wav", ".mp3", ".flac", ".m4a", ".ogg", ".opus"}
LABEL_KODE = {"F": "bukan_penipuan", "I": "penipuan"}
AMBANG_RENDAH = 0.60    # kemiripan di bawah ini: pasangan diragukan, cek manual
AMBANG_SELISIH = 0.08   # naskah kedua hampir sama miripnya: cek manual


def kata(t):
    return re.findall(r"[a-z0-9]+", (t or "").lower())


def mirip(a, b):
    return SequenceMatcher(None, kata(a), kata(b), autojunk=False).ratio()


# Rumus WER sama persis dengan evaluasi_isi.py, supaya bisa dibandingkan dengan WER MMS.
def normalisasi_wer(teks):
    return re.sub(r"[^\w\s]", " ", (teks or "").lower()).split()


def wer(acuan, hasil):
    r, h = normalisasi_wer(acuan), normalisasi_wer(hasil)
    if not r:
        return None
    prev = list(range(len(h) + 1))
    for i, kr in enumerate(r, start=1):
        cur = [i]
        for j, kh in enumerate(h, start=1):
            cur.append(min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (kr != kh)))
        prev = cur
    return prev[-1] / len(r)


def baca_naskah(path):
    """Ambil setiap blok '[F001] formal_001 | kategori' beserta teks di bawahnya."""
    teks = path.read_text(encoding="utf-8-sig").replace("\r\n", "\n")
    pola = re.compile(r"^\[([A-Z])(\d+)\][^\n|]*\|[ \t]*([^\n]+)\n(.+?)(?=\n[ \t]*\n|\Z)", re.M | re.S)
    hasil = []
    for m in pola.finditer(teks):
        huruf, nomor, kategori, isi = m.groups()
        if huruf in LABEL_KODE:
            hasil.append({"kode": f"{huruf}{nomor}", "kategori": kategori.strip(),
                          "label": LABEL_KODE[huruf], "teks": re.sub(r"\s+", " ", isi).strip()})
    return hasil


def ambil_transkrip(audio, folder_cache, jeda):
    """Pakai transkrip tersimpan bila ada; jika belum, panggil Groq lalu simpan."""
    f = folder_cache / f"{audio.stem}.json"
    if f.exists():
        return json.loads(f.read_text(encoding="utf-8")), False
    hasil = transkripsi(str(audio))
    folder_cache.mkdir(parents=True, exist_ok=True)
    f.write_text(json.dumps(hasil, ensure_ascii=False, indent=2), encoding="utf-8")
    time.sleep(jeda)
    return hasil, True


def pct(x):
    return f"{x * 100:.1f}%".replace(".", ",")


def main():
    ap = argparse.ArgumentParser(description="Pisahkan audio penipuan / bukan penipuan berdasarkan naskah, lalu hitung WER.")
    ap.add_argument("folder", help="folder berisi audio dan file naskah")
    ap.add_argument("--naskah", help="file naskah (bawaan: satu-satunya file .txt di folder)")
    ap.add_argument("--jeda", type=float, default=3.0, help="jeda detik antar panggilan Groq")
    ap.add_argument("--cache", help=argparse.SUPPRESS)
    ap.add_argument("--keluaran", help=argparse.SUPPRESS)
    a = ap.parse_args()

    # 1. Siapkan folder, naskah, dan daftar audio
    folder = Path(a.folder).resolve()
    if not folder.is_dir():
        sys.exit(f"Folder tidak ditemukan: {folder}")
    if a.naskah:
        file_naskah = Path(a.naskah)
    else:
        txt = [p for p in folder.glob("*.txt") if not p.name.startswith("hasil_pemisahan")]
        if len(txt) != 1:
            sys.exit(f"Ada {len(txt)} file .txt di folder. Sebutkan naskahnya dengan --naskah PATH.")
        file_naskah = txt[0]
    naskah = baca_naskah(file_naskah)
    if not naskah:
        sys.exit(f"Tidak ada naskah berformat '[F001] ... | kategori' di {file_naskah.name}")
    audio = sorted(p for p in folder.iterdir() if p.suffix.lower() in EKSTENSI)
    if not audio:
        sys.exit("Tidak ada file audio di folder.")
    folder_cache = Path(a.cache) if a.cache else AKAR_VOICE / "results" / "transkrip" / f"naskah_{folder.name}"
    keluaran = Path(a.keluaran) if a.keluaran else folder
    n_pen = sum(n["label"] == "penipuan" for n in naskah)
    print(f"Naskah: {file_naskah.name} -> {len(naskah)} naskah ({n_pen} penipuan, {len(naskah) - n_pen} bukan penipuan)")
    print(f"Audio : {len(audio)} file\n")

    # 2. Transkripsi tiap audio (Groq Whisper, sama dengan sistem)
    baris = []
    for i, p in enumerate(audio, 1):
        try:
            tr, baru = ambil_transkrip(p, folder_cache, a.jeda)
            print(f"[{i}/{len(audio)}] {p.name}: {'ditranskripsi' if baru else 'dari cache'}")
            baris.append({"file": p.name, "transkrip": tr.get("teks", "")})
        except Exception as e:
            print(f"[{i}/{len(audio)}] {p.name}: GAGAL - {e}")
            baris.append({"file": p.name, "status": f"GAGAL TRANSKRIPSI: {e}"})

    # 3. Cocokkan tiap transkrip dengan naskah yang paling mirip
    for b in baris:
        if "transkrip" not in b:
            continue
        skor = sorted(((mirip(n["teks"], b["transkrip"]), k) for k, n in enumerate(naskah)), reverse=True)
        s1, k1 = skor[0]
        s2, k2 = skor[1] if len(skor) > 1 else (0.0, k1)
        n = naskah[k1]
        catatan = []
        if s1 < AMBANG_RENDAH:
            catatan.append("mirip rendah")
        if s1 >= AMBANG_RENDAH and s1 - s2 < AMBANG_SELISIH:
            catatan.append(f"ragu, {naskah[k2]['kode']} juga mirip ({pct(s2)})")
        b.update(kode=n["kode"], kategori=n["kategori"], label=n["label"], kemiripan=s1,
                 wer=wer(n["teks"], b["transkrip"]), naskah=n["teks"], catatan=catatan)

    # Satu naskah dibaca lebih dari satu orang: wajar (labelnya tetap sama), hanya dicatat sebagai info
    pakai = {}
    for b in baris:
        if b.get("kode"):
            pakai.setdefault(b["kode"], []).append(b["file"])
    for b in baris:
        if b.get("kode"):
            lain = [f for f in pakai[b["kode"]] if f != b["file"]]
            b["info"] = ("naskah sama dengan " + ", ".join(lain)) if lain else ""
            b["status"] = ("CEK MANUAL: " + "; ".join(b["catatan"])) if b["catatan"] else "ok"

    # 4. Simpan tabel lengkap (CSV)
    keluaran.mkdir(parents=True, exist_ok=True)
    with open(keluaran / "hasil_pemisahan.csv", "w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f)
        w.writerow(["file", "label", "kode_naskah", "kategori", "kemiripan_persen", "wer_persen",
                    "status", "info", "transkrip", "naskah"])
        for b in baris:
            w.writerow([b["file"], b.get("label", ""), b.get("kode", ""), b.get("kategori", ""),
                        f"{b['kemiripan'] * 100:.0f}" if "kemiripan" in b else "",
                        f"{b['wer'] * 100:.1f}" if b.get("wer") is not None else "",
                        b["status"], b.get("info", ""), b.get("transkrip", ""), b.get("naskah", "")])

    # 5. Simpan ringkasan (TXT) dan tampilkan
    ok = [b for b in baris if b["status"] == "ok"]
    cek = [b for b in baris if b["status"] != "ok"]
    out = ["HASIL PEMISAHAN AUDIO BERDASARKAN NASKAH",
           f"Naskah : {file_naskah.name}",
           f"Audio  : {len(baris)} file | yakin: {len(ok)} | perlu dicek manual: {len(cek)}", ""]
    for lbl, judul in (("penipuan", "PENIPUAN"), ("bukan_penipuan", "BUKAN PENIPUAN")):
        grup = [b for b in ok if b["label"] == lbl]
        out.append(f"=== {judul} ({len(grup)} file) ===")
        for b in grup:
            out.append(f"  {b['file']:<18} {b['kode']:<6} {b['kategori']:<26} mirip {pct(b['kemiripan']):>6}   WER {pct(b['wer']):>6}"
                       + (f"   ({b['info']})" if b["info"] else ""))
        out.append("")
    out.append(f"=== PERLU DICEK MANUAL ({len(cek)} file) ===")
    for b in cek:
        dugaan = f"dugaan {b['label']} ({b['kode']}, mirip {pct(b['kemiripan'])}) " if b.get("kode") else ""
        out.append(f"  {b['file']:<18} {dugaan}-> {b['status']}")
    out += ["", "=== WER (hanya file yang yakin) ==="]
    for nama, grup in (("semua", ok),
                       ("penipuan", [b for b in ok if b["label"] == "penipuan"]),
                       ("bukan penipuan", [b for b in ok if b["label"] == "bukan_penipuan"])):
        xs = [b["wer"] for b in grup if b.get("wer") is not None]
        if xs:
            out.append(f"  {nama:<15} n={len(xs):>3}   rata-rata {pct(statistics.mean(xs)):>6}   tengah {pct(statistics.median(xs)):>6}")
    out += ["", "Label diambil dari kode naskah (F = bukan penipuan, I = penipuan), BUKAN dari Gemini."]
    teks_out = "\n".join(out)
    (keluaran / "hasil_pemisahan.txt").write_text(teks_out + "\n", encoding="utf-8")
    print("\n" + teks_out)
    print(f"\nTersimpan:\n  {keluaran / 'hasil_pemisahan.txt'}\n  {keluaran / 'hasil_pemisahan.csv'}")


if __name__ == "__main__":
    main()