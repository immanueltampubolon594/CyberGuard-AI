"""
Membuat grafik dari hasil evaluasi analisis isi audio (hasil_per_file.csv).

Cara pakai (dari folder backend, venv aktif, PowerShell):
  python voice\\scripts\\grafik_evaluasi.py

Pilihan:
  --csv     alamat hasil_per_file.csv   (bawaan: voice\\results\\analisis_audio\\evaluasi_isi\\hasil_per_file.csv)
  --keluar  folder tujuan gambar        (bawaan: folder yang sama, subfolder "grafik")

Hasil (PNG, siap ditempel di laporan atau slide):
  1_confusion_matrix.png      berapa audio yang benar/salah per label
  2_perbandingan_metode.png   aturan saja vs Gemini saja vs sistem (akurasi ketat & longgar)
  3_hasil_per_sumber.png      label yang diberikan sistem pada setiap sumber data
  4_ambang_60_vs_55.png       pengaruh ambang penipuan pada data uji

Tidak memakai internet, Groq, atau Gemini. Hanya membaca CSV hasil evaluasi.
"""

import argparse
import csv
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402

AKAR = Path(__file__).resolve().parent.parent  # backend/voice
CSV_BAWAAN = AKAR / "results" / "analisis_audio" / "evaluasi_isi" / "hasil_per_file.csv"

# Harus sama dengan scam_analyzer.py
BOBOT_LLM, BOBOT_ATURAN = 0.6, 0.4
AMBANG_MENCURIGAKAN = 30

# Warna
BIRU, ORANYE = "#2a78d6", "#eb6834"
WARNA_LABEL = {"penipuan": "#d03b3b", "mencurigakan": "#fab219", "aman": "#0ca30c"}
TEKS, TEKS_2, GARIS, LATAR = "#0b0b0b", "#52514e", "#e4e3df", "#fcfcfb"
LABEL = ["penipuan", "mencurigakan", "aman"]
KOLOM_SISTEM = "label_gabungan_gerbang"  # diganti di main() bila CSV punya kolom label_sistem

plt.rcParams.update({
    "font.size": 11, "axes.edgecolor": GARIS, "axes.labelcolor": TEKS_2,
    "xtick.color": TEKS_2, "ytick.color": TEKS_2, "axes.titlesize": 13,
    "axes.titleweight": "bold", "axes.titlecolor": TEKS, "figure.facecolor": LATAR,
    "axes.facecolor": LATAR, "savefig.facecolor": LATAR,
})


# ── Data ─────────────────────────────────────────────────────────

def baca(path):
    teks = Path(path).read_text(encoding="utf-8-sig")
    pemisah = ";" if teks.splitlines()[0].count(";") > teks.splitlines()[0].count(",") else ","
    return list(csv.DictReader(teks.splitlines(), delimiter=pemisah))


def label_dari_skor(skor, ambang_penipuan):
    if skor >= ambang_penipuan:
        return "penipuan"
    if skor >= AMBANG_MENCURIGAKAN:
        return "mencurigakan"
    return "aman"


def label_sistem(r, ambang_penipuan):
    """Hitung ulang label sistem untuk ambang tertentu (dipakai di grafik 4)."""
    if ambang_penipuan == 60:
        return r["label_gabungan_gerbang"]  # pakai hasil asli evaluasi
    skor = round(BOBOT_LLM * float(r["skor_gemini"]) + BOBOT_ATURAN * float(r["skor_aturan"]))
    label = label_dari_skor(skor, ambang_penipuan)
    # Label "aman" dari gerbang/pengaman di hasil asli tetap dihormati
    if r["label_gabungan_gerbang"] == "aman":
        label = "aman"
    elif r["label_gabungan_gerbang"] == "mencurigakan" and label == "aman":
        label = "mencurigakan"
    return label


def metrik(benar, prediksi, longgar=False):
    pos = {"penipuan", "mencurigakan"} if longgar else {"penipuan"}
    tp = sum(b == "penipuan" and p in pos for b, p in zip(benar, prediksi))
    fp = sum(b != "penipuan" and p in pos for b, p in zip(benar, prediksi))
    fn = sum(b == "penipuan" and p not in pos for b, p in zip(benar, prediksi))
    tn = len(benar) - tp - fp - fn
    presisi = tp / (tp + fp) if tp + fp else 0
    recall = tp / (tp + fn) if tp + fn else 0
    f1 = 2 * presisi * recall / (presisi + recall) if presisi + recall else 0
    return {"presisi": presisi, "recall": recall, "f1": f1, "akurasi": (tp + tn) / len(benar)}


# ── Pembantu gambar ──────────────────────────────────────────────

def rapikan(ax, grid="y"):
    for s in ("top", "right"):
        ax.spines[s].set_visible(False)
    ax.grid(axis=grid, color=GARIS, linewidth=0.8)
    ax.set_axisbelow(True)


def simpan(fig, folder, nama):
    fig.tight_layout()
    path = folder / nama
    fig.savefig(path, dpi=200)
    plt.close(fig)
    print("  disimpan:", path)


# ── Grafik ───────────────────────────────────────────────────────

def g1_confusion(rows, folder):
    benar = ["penipuan", "aman"]
    m = [[sum(r["label_benar"] == b and r[KOLOM_SISTEM] == p for r in rows) for p in LABEL] for b in benar]
    fig, ax = plt.subplots(figsize=(7, 3.6))
    maks = max(max(b) for b in m)
    ax.imshow(m, cmap="Blues", vmin=0, vmax=maks * 1.15, aspect="auto")
    for i, baris in enumerate(m):
        for j, v in enumerate(baris):
            gelap = v > maks * 0.55
            ax.text(j, i, str(v), ha="center", va="center", fontsize=16, fontweight="bold",
                    color="white" if gelap else TEKS)
    ax.set_xticks(range(3), [l.capitalize() for l in LABEL])
    ax.set_yticks(range(2), [f"{b.capitalize()}\n({sum(m[i])} audio)" for i, b in enumerate(benar)])
    ax.set_xlabel("Label dari sistem")
    ax.set_ylabel("Jawaban benar")
    ax.set_title("Confusion matrix analisis isi audio", loc="left")
    ax.tick_params(length=0)
    for s in ax.spines.values():
        s.set_visible(False)
    simpan(fig, folder, "1_confusion_matrix.png")


def g2_metode(rows, folder):
    benar = [r["label_benar"] for r in rows]
    metode = {
        "Aturan pola saja": [r["label_aturan"] for r in rows],
        "Label Gemini": [r["label_gemini"] for r in rows],
        "Gabungan 60/40": [r["label_gabungan_gerbang"] for r in rows],
    }
    if KOLOM_SISTEM == "label_sistem":
        metode["Skor Gemini\n(sistem sekarang)"] = [r["label_sistem"] for r in rows]
    ketat = [metrik(benar, p)["akurasi"] * 100 for p in metode.values()]
    longgar = [metrik(benar, p, True)["akurasi"] * 100 for p in metode.values()]
    fig, ax = plt.subplots(figsize=(2.6 * len(metode) + 1, 4.2))
    x = range(len(metode))
    w = 0.36
    b1 = ax.bar([i - w / 2 - 0.01 for i in x], ketat, w, color=BIRU, label="Ketat (hanya label penipuan)")
    b2 = ax.bar([i + w / 2 + 0.01 for i in x], longgar, w, color=ORANYE, label="Longgar (penipuan + mencurigakan)")
    for bars in (b1, b2):
        for b in bars:
            ax.text(b.get_x() + b.get_width() / 2, b.get_height() + 1.5, f"{b.get_height():.1f}%",
                    ha="center", fontsize=10, color=TEKS)
    ax.set_xticks(list(x), list(metode))
    ax.set_ylim(0, 128)
    ax.set_yticks(range(0, 101, 20))
    ax.set_ylabel("Akurasi (%)")
    ax.set_title(f"Perbandingan metode ({len(rows)} audio)", loc="left")
    ax.legend(frameon=False, loc="upper left", ncol=2, fontsize=9.5)
    rapikan(ax)
    simpan(fig, folder, "2_perbandingan_metode.png")


def g3_sumber(rows, folder):
    kelompok = {}
    for r in rows:
        kelompok.setdefault((r["sumber"], r["label_benar"]), []).append(r[KOLOM_SISTEM])
    urut = sorted(kelompok, key=lambda k: (k[1] != "penipuan", k[0]))
    nama = [f"{s}\n(benar: {b}, n={len(kelompok[(s, b)])})" for s, b in urut]
    fig, ax = plt.subplots(figsize=(9, 0.75 * len(urut) + 1.4))
    kiri = [0] * len(urut)
    for lab in LABEL:
        nilai = [100 * kelompok[k].count(lab) / len(kelompok[k]) for k in urut]
        bars = ax.barh(nama, nilai, left=kiri, color=WARNA_LABEL[lab], edgecolor=LATAR,
                       linewidth=2, label=lab.capitalize(), height=0.6)
        for b, v, k in zip(bars, nilai, urut):
            if v >= 8:
                ax.text(b.get_x() + v / 2, b.get_y() + b.get_height() / 2, str(kelompok[k].count(lab)),
                        ha="center", va="center", fontsize=10, color="white" if lab != "mencurigakan" else TEKS)
        kiri = [a + b for a, b in zip(kiri, nilai)]
    ax.invert_yaxis()
    ax.set_xlim(0, 100)
    ax.set_xlabel("Persentase audio (%)  —  angka di batang = jumlah audio")
    ax.set_title("Label dari sistem pada setiap sumber data", loc="left")
    ax.legend(frameon=False, ncol=3, loc="upper left", bbox_to_anchor=(0, -0.12 - 0.3 / len(urut)), fontsize=10)
    rapikan(ax, grid="x")
    simpan(fig, folder, "3_hasil_per_sumber.png")


def g4_ambang(rows, folder):
    uji = [r for r in rows if r.get("bagian") == "uji"]
    if not uji:
        print("  (lewati grafik 4: tidak ada data bagian uji)")
        return
    benar = [r["label_benar"] for r in uji]
    hasil = {a: metrik(benar, [label_sistem(r, a) for r in uji]) for a in (60, 55)}
    nama_m = ["presisi", "recall", "f1"]
    fig, ax = plt.subplots(figsize=(8, 4.2))
    x = range(len(nama_m))
    w = 0.36
    for k, (a, warna) in enumerate(((60, BIRU), (55, ORANYE))):
        nilai = [hasil[a][m] * 100 for m in nama_m]
        bars = ax.bar([i + (k - 0.5) * (w + 0.02) for i in x], nilai, w, color=warna,
                      label=f"Ambang {a}" + (" (sekarang)" if a == 60 else " (usulan)"))
        for b in bars:
            ax.text(b.get_x() + b.get_width() / 2, b.get_height() + 1.5, f"{b.get_height():.1f}%",
                    ha="center", fontsize=10, color=TEKS)
    ax.set_xticks(list(x), ["Presisi", "Recall", "F1"])
    ax.set_ylim(0, 128)
    ax.set_yticks(range(0, 101, 20))
    ax.set_ylabel("Nilai (%)  —  hitungan ketat")
    ax.set_title(f"Pengaruh ambang penipuan pada data uji ({len(uji)} audio)", loc="left")
    ax.legend(frameon=False, loc="upper left", ncol=2, fontsize=9.5)
    rapikan(ax)
    simpan(fig, folder, "4_ambang_60_vs_55.png")


def main():
    ap = argparse.ArgumentParser(description="Grafik hasil evaluasi analisis isi audio.")
    ap.add_argument("--csv", default=str(CSV_BAWAAN))
    ap.add_argument("--keluar", default=None)
    a = ap.parse_args()

    rows = baca(a.csv)
    global KOLOM_SISTEM
    if rows and "label_sistem" in rows[0]:
        KOLOM_SISTEM = "label_sistem"
    folder = Path(a.keluar) if a.keluar else Path(a.csv).parent / "grafik"
    folder.mkdir(parents=True, exist_ok=True)
    print(f"Membaca {len(rows)} audio dari {a.csv}")

    g1_confusion(rows, folder)
    g2_metode(rows, folder)
    g3_sumber(rows, folder)
    if KOLOM_SISTEM == "label_gabungan_gerbang":
        g4_ambang(rows, folder)   # hanya relevan untuk rancangan gabungan 60/40
    else:
        print("  (grafik 4 dilewati: ambang 60 vs 55 hanya untuk rancangan gabungan lama)")
    print("Selesai.")


if __name__ == "__main__":
    main()