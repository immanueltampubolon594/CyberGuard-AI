"""
Membuat grafik WER (Word Error Rate) transkripsi dari semua audio yang punya naskah.

Hanya membaca CSV hasil yang sudah ada. Tidak memakai internet, Groq, atau Gemini.
  1. hasil_per_file.csv   dari evaluasi_isi.py           -> kolom "wer" (audio MMS, dll.)
  2. hasil_pemisahan.csv  dari pisahkan_audio_naskah.py  -> kolom "wer_persen" (rekaman manusia)

Cara pakai (PowerShell, dari folder backend, venv aktif):
  python voice\\scripts\\grafik_wer.py

Pilihan:
  --evaluasi PATH     hasil_per_file.csv   (bawaan: hasil model gemini-3.5-flash-lite)
  --manusia PATH ...  hasil_pemisahan.csv  (bawaan: data_uji\\manusia_baru); boleh lebih dari satu
  --keluar PATH       folder tujuan        (bawaan: ...\\evaluasi_isi\\grafik_wer, sudah di-gitignore)

Hasil (PNG siap ditempel di laporan atau slide):
  wer_1_sebaran.png    jumlah audio per rentang WER
  wer_2_per_audio.png  WER tiap audio, diurutkan dari terkecil
  ringkasan_wer.txt    rata-rata, median, terkecil, terbesar, sebaran, dan daftar audio WER >= 30%

Patokan rentang (Microsoft Azure Speech, "Test accuracy of a custom speech model"):
  WER 5-10% baik, sekitar 20% dapat diterima, 30% atau lebih buruk.
"""

import argparse
import csv
import statistics
import sys
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

AKAR = Path(__file__).resolve().parent.parent  # backend/voice
FOLDER_EVAL = AKAR / "results" / "analisis_audio" / "evaluasi_isi"
EVAL_BAWAAN = FOLDER_EVAL / "model_gemini-3.5-flash-lite" / "hasil_per_file.csv"
MANUSIA_BAWAAN = AKAR / "data_uji" / "manusia_baru" / "hasil_pemisahan.csv"
KELUAR_BAWAAN = FOLDER_EVAL / "grafik_wer"

# Warna sama dengan grafik_evaluasi.py (urutan tetap; sudah dicek aman untuk buta warna)
WARNA = ["#2a78d6", "#eb6834", "#1baf7a"]
TEKS, TEKS_2, GARIS, LATAR = "#0b0b0b", "#52514e", "#e4e3df", "#fcfcfb"
NAMA_SUMBER = {"mms": "MMS (suara AI)", "Eleven Labs": "Eleven Labs (suara AI)",
               "youtube": "YouTube (manusia)", "manusia_penipuan": "Manusia (WhatsApp)"}
RENTANG = ["≤10%\n(baik)", ">10–20%\n(dapat diterima)", ">20–<30%", "≥30%\n(buruk)"]
PATOKAN = "Patokan: Microsoft Azure Speech — WER 5–10% baik, sekitar 20% dapat diterima, ≥30% buruk."

plt.rcParams.update({
    "font.size": 11, "axes.edgecolor": GARIS, "axes.labelcolor": TEKS_2,
    "xtick.color": TEKS_2, "ytick.color": TEKS_2, "axes.titlesize": 13,
    "axes.titleweight": "bold", "axes.titlecolor": TEKS, "figure.facecolor": LATAR,
    "axes.facecolor": LATAR, "savefig.facecolor": LATAR,
})


# ── Data ─────────────────────────────────────────────────────────

def baca(path):
    teks = Path(path).read_text(encoding="utf-8-sig")
    baris1 = teks.splitlines()[0]
    pemisah = ";" if baris1.count(";") > baris1.count(",") else ","
    return list(csv.DictReader(teks.splitlines(), delimiter=pemisah))


def kumpulkan(path_eval, paths_manusia):
    """Hasil: dict {nama_kelompok: [(id_audio, wer_persen), ...]} sesuai urutan baca."""
    data = {}
    if path_eval and Path(path_eval).exists():
        for r in baca(path_eval):
            if r.get("wer", "").strip():
                nama = NAMA_SUMBER.get(r["sumber"], r["sumber"])
                id_ = r["id"].removeprefix(r["sumber"] + "_")
                data.setdefault(nama, []).append((id_, float(r["wer"]) * 100))
    else:
        print("Peringatan: file evaluasi tidak ditemukan:", path_eval)
    for p in paths_manusia:
        if not Path(p).exists():
            print("Peringatan: file manusia tidak ditemukan:", p)
            continue
        nama = "Manusia" if len(paths_manusia) == 1 else f"Manusia ({Path(p).parent.name})"
        for r in baca(p):
            if r.get("wer_persen", "").strip():
                data.setdefault(nama, []).append((Path(r["file"]).stem, float(r["wer_persen"])))
    return data


def rentang(w):
    w = round(w, 1)  # supaya 10,0% tidak terbaca 10,0000001%
    if w <= 10:
        return 0
    if w <= 20:
        return 1
    if w < 30:
        return 2
    return 3


def pct(x):
    return f"{x:.1f}%".replace(".", ",")


# ── Pembantu gambar ──────────────────────────────────────────────

def rapikan(ax, grid="y"):
    for s in ("top", "right"):
        ax.spines[s].set_visible(False)
    ax.grid(axis=grid, color=GARIS, linewidth=0.8)
    ax.set_axisbelow(True)


def simpan(fig, folder, nama, rect=None):
    fig.tight_layout(rect=rect)
    path = folder / nama
    fig.savefig(path, dpi=200)
    plt.close(fig)
    print("  disimpan:", path)


# ── Grafik ───────────────────────────────────────────────────────

def g1_sebaran(data, folder):
    n = sum(len(v) for v in data.values())
    fig, ax = plt.subplots(figsize=(8.5, 4.6))
    k = len(data)
    w = 0.8 / k
    for i, (nama, isi) in enumerate(data.items()):
        hitung = [sum(rentang(x) == j for _, x in isi) for j in range(4)]
        xs = [j + (i - (k - 1) / 2) * w for j in range(4)]
        bars = ax.bar(xs, hitung, w, color=WARNA[i], edgecolor=LATAR, linewidth=1.5,
                      label=f"{nama} — {len(isi)} audio")
        for b, v in zip(bars, hitung):
            ax.text(b.get_x() + b.get_width() / 2, v + 0.3, str(v), ha="center", va="bottom",
                    fontsize=10, color=TEKS)
    ax.set_xticks(range(4), RENTANG)
    ax.set_ylabel("Jumlah audio")
    ax.set_title(f"Sebaran WER per rentang ({n} audio dengan naskah)", loc="left")
    ax.set_ylim(0, ax.get_ylim()[1] * 1.12)
    ax.legend(frameon=False, loc="upper right", fontsize=9.5)
    rapikan(ax)
    fig.text(0.01, 0.015, PATOKAN, fontsize=8.5, color=TEKS_2)
    simpan(fig, folder, "wer_1_sebaran.png", rect=(0, 0.06, 1, 1))


def g2_per_audio(data, folder):
    semua = [(x, i, id_) for i, isi in enumerate(data.values()) for id_, x in isi]
    semua.sort(key=lambda t: (t[0], t[1]))
    fig, ax = plt.subplots(figsize=(10, 4.8))
    for i, nama in enumerate(data):
        pts = [(urut, x) for urut, (x, g, _) in enumerate(semua, 1) if g == i]
        ax.scatter([p[0] for p in pts], [p[1] for p in pts], s=48, color=WARNA[i],
                   edgecolors=LATAR, linewidths=1.2, zorder=3, label=nama)
    for garis, ket in ((10, "10% · batas baik"), (20, "20% · dapat diterima"), (30, "30% · buruk")):
        ax.axhline(garis, color=TEKS_2, linewidth=0.9, linestyle=(0, (4, 3)), zorder=1)
        ax.text(1, garis + 0.8, ket, fontsize=8.5, color=TEKS_2, va="bottom")
    for urut, (x, _, id_) in list(enumerate(semua, 1))[-2:]:   # beri nama 2 audio tertinggi
        ax.annotate(f"{id_} ({pct(x)})", (urut, x), xytext=(-8, 0), textcoords="offset points",
                    ha="right", va="center", fontsize=9, color=TEKS)
    ax.set_xlim(0, len(semua) + 1)
    ax.set_ylim(0, max(35, max(t[0] for t in semua) * 1.1))
    ax.set_xlabel("Urutan audio (1 = WER terkecil)")
    ax.set_ylabel("WER (%)")
    ax.set_title(f"WER tiap audio, diurutkan dari terkecil ({len(semua)} audio)", loc="left")
    ax.legend(frameon=False, loc="upper left", bbox_to_anchor=(0, 0.93), fontsize=9.5)
    rapikan(ax, grid="y")
    simpan(fig, folder, "wer_2_per_audio.png")


# ── Ringkasan teks ───────────────────────────────────────────────

def ringkasan(data, folder):
    kel = dict(data)
    if len(data) > 1:
        kel["Gabungan"] = [t for isi in data.values() for t in isi]
    out = ["RINGKASAN WER TRANSKRIPSI (Groq Whisper)", "",
           f"{'Kelompok':<24}{'Jumlah':>7}{'Rata-rata':>11}{'Median':>9}{'Terkecil':>10}{'Terbesar':>10}"]
    for nama, isi in kel.items():
        v = [x for _, x in isi]
        out.append(f"{nama:<24}{len(v):>7}{pct(statistics.mean(v)):>11}{pct(statistics.median(v)):>9}"
                   f"{pct(min(v)):>10}{pct(max(v)):>10}")
    out += ["", "Sebaran per rentang (jumlah audio dan persentase):",
            f"{'Kelompok':<24}{'<=10% baik':>14}{'>10-20% diterima':>18}{'>20-<30%':>12}{'>=30% buruk':>14}"]
    for nama, isi in kel.items():
        sel = []
        for j in range(4):
            c = sum(rentang(x) == j for _, x in isi)
            sel.append(f"{c} ({c / len(isi) * 100:.0f}%)")
        out.append(f"{nama:<24}{sel[0]:>14}{sel[1]:>18}{sel[2]:>12}{sel[3]:>14}")
    semua = kel.get("Gabungan", next(iter(kel.values())))
    out += ["", f"Audio dengan WER 0% (sama persis dengan naskah): {sum(round(x, 1) == 0 for _, x in semua)}",
            "", "Audio dengan WER >= 30% (perlu dijelaskan penyebabnya di laporan):"]
    for id_, x in sorted((t for t in semua if rentang(t[1]) == 3), key=lambda t: -t[1]):
        out.append(f"  {id_:<16}{pct(x):>7}")
    out += ["", PATOKAN]
    teks = "\n".join(out)
    (folder / "ringkasan_wer.txt").write_text(teks + "\n", encoding="utf-8")
    print("\n" + teks + "\n")
    print("  disimpan:", folder / "ringkasan_wer.txt")


def main():
    ap = argparse.ArgumentParser(description="Grafik WER transkripsi dari audio yang punya naskah.")
    ap.add_argument("--evaluasi", default=str(EVAL_BAWAAN), help="hasil_per_file.csv dari evaluasi_isi.py")
    ap.add_argument("--manusia", nargs="*", default=[str(MANUSIA_BAWAAN)],
                    help="hasil_pemisahan.csv dari pisahkan_audio_naskah.py (boleh lebih dari satu)")
    ap.add_argument("--keluar", default=str(KELUAR_BAWAAN), help="folder tujuan gambar")
    a = ap.parse_args()

    data = kumpulkan(a.evaluasi, a.manusia)
    if not data:
        sys.exit("Tidak ada audio dengan nilai WER. Jalankan evaluasi_isi.py hitung atau pisahkan_audio_naskah.py dulu.")
    if len(data) > len(WARNA):
        sys.exit(f"Ada {len(data)} kelompok; grafik ini maksimal {len(WARNA)} kelompok agar warnanya tetap mudah dibedakan.")
    folder = Path(a.keluar)
    folder.mkdir(parents=True, exist_ok=True)
    print("Kelompok:", ", ".join(f"{k} ({len(v)})" for k, v in data.items()))
    g1_sebaran(data, folder)
    g2_per_audio(data, folder)
    ringkasan(data, folder)


if __name__ == "__main__":
    main()