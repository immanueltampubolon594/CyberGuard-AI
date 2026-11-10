"""
Tahap 8 - langkah 2: evaluasi akurasi ANALISIS ISI audio (penipuan atau bukan).

Bekerja dalam dua tahap agar hemat kuota Groq dan Gemini:

  1. jalankan : tiap audio di label_uji.csv diproses SEKALI (transkripsi -> aturan -> Gemini).
                Hasilnya disimpan di folder cache. Audio yang sudah ada di cache dilewati,
                jadi aman dihentikan dan dilanjutkan kapan saja.
  2. hitung   : membaca cache lalu menghitung, TANPA internet dan tanpa kuota:
                - precision, recall, F1, confusion matrix: aturan saja, Gemini saja, gabungan
                - efek "gerbang permintaan" (gabungan dengan dan tanpa gerbang)
                - penyetelan bobot dan ambang pada data pengembangan (dev), diuji pada data uji
                - WER transkripsi (hanya untuk audio yang kolom teks_acuan-nya diisi)
                - waktu proses per tahap
                - hasil dipisah per sumber, dan daftar audio yang salah

Cara pakai (dari folder backend, venv aktif, PowerShell):

  python voice\\scripts\\evaluasi_isi.py status
  python voice\\scripts\\evaluasi_isi.py jalankan --batas 25
  python voice\\scripts\\evaluasi_isi.py hitung

Pilihan:
  jalankan --batas N   proses paling banyak N audio baru per kali jalan (bawaan: semua)
  jalankan --jeda S    jeda S detik antar audio agar tidak kena batas kuota (bawaan 6)
  jalankan --paksa     abaikan cache dan proses ulang semua (memakai kuota lagi)
  --label PATH         alamat label_uji.csv, ditulis SEBELUM nama perintah, mis.
                       python voice\\scripts\\evaluasi_isi.py --label D:\\x\\label.csv hitung
                       (bawaan: voice\\data_uji\\label_uji.csv, biasanya tidak perlu diubah)

Jawaban benar dibuat dengan buat_label_uji.py. Hasil laporan disimpan di
  voice\\results\\analisis_audio\\evaluasi_isi\\laporan.md  dan  hasil_per_file.csv
(folder ini sudah di-gitignore).

Catatan: hanya memakai audio uji buatan sendiri, suara AI, atau pidato publik. Jangan memakai
telepon asli, karena teksnya dikirim ke Groq dan Google.
"""

import argparse
import csv
import hashlib
import json
import re
import statistics
import sys
import time
from pathlib import Path

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

AKAR_BACKEND = Path(__file__).resolve().parents[2]
AKAR_VOICE = AKAR_BACKEND / "voice"
sys.path.insert(0, str(AKAR_BACKEND))

from services.audio.scam_analyzer import (  # noqa: E402
    AMBANG_MENCURIGAKAN,
    AMBANG_PENIPUAN,
    BOBOT_LLM,
    KATEGORI_PERMINTAAN,
)
from services.audio.scam_llm import AnalisisLLMError, analisis_llm  # noqa: E402
from services.audio.scam_rules import analisis_aturan  # noqa: E402
from services.audio.transcriber import TranskripsiError, transkripsi  # noqa: E402

FILE_LABEL = AKAR_VOICE / "data_uji" / "label_uji.csv"
FOLDER_HASIL = AKAR_VOICE / "results" / "analisis_audio" / "evaluasi_isi"
FOLDER_CACHE = FOLDER_HASIL / "cache"

LABEL_ISI_VALID = {"penipuan", "aman"}
JENIS_SUARA_VALID = {"asli", "sintetis"}


# ── Membaca daftar jawaban benar ─────────────────────────────────

def baca_label(path: Path) -> list[dict]:
    if not path.exists():
        sys.exit(f"label_uji.csv belum ada: {path}\nBuat dulu dengan buat_label_uji.py.")
    teks = path.read_text(encoding="utf-8-sig")
    baris_pertama = teks.splitlines()[0] if teks.strip() else ""
    pemisah = ";" if baris_pertama.count(";") > baris_pertama.count(",") else ","
    rows = list(csv.DictReader(teks.splitlines(), delimiter=pemisah))

    hasil, ids, masalah = [], set(), []
    for n, r in enumerate(rows, start=2):
        r = {k.strip(): (v or "").strip() for k, v in r.items() if k}
        if not r.get("id") or not r.get("path"):
            masalah.append(f"baris {n}: kolom id atau path kosong")
            continue
        if r["id"] in ids:
            masalah.append(f"baris {n}: id ganda ({r['id']})")
            continue
        if r.get("label_isi") not in LABEL_ISI_VALID:
            masalah.append(f"baris {n}: label_isi harus penipuan atau aman (isi: {r.get('label_isi')!r})")
            continue
        if r.get("jenis_suara") not in JENIS_SUARA_VALID:
            masalah.append(f"baris {n}: jenis_suara harus asli atau sintetis (isi: {r.get('jenis_suara')!r})")
            continue
        ids.add(r["id"])
        r.setdefault("sumber", "")
        r.setdefault("bagian", "")
        r.setdefault("teks_acuan", "")
        hasil.append(r)

    if masalah:
        print("PERINGATAN pada label_uji.csv (baris ini dilewati):")
        for m in masalah[:15]:
            print("  -", m)
    if not hasil:
        sys.exit("Tidak ada baris yang valid di label_uji.csv.")
    return hasil


def tetapkan_bagian(rows: list[dict]) -> dict:
    """
    Bagi data jadi 'dev' (untuk menyetel bobot) dan 'uji' (untuk mengukur akhir).
    Kolom bagian yang sudah diisi dihormati. Sisanya dibagi 50:50 secara tetap (hash dari id)
    di dalam tiap kelompok (label_isi + sumber), jadi hasilnya sama setiap kali dijalankan.
    """
    hasil = {r["id"]: r["bagian"] for r in rows if r["bagian"] in {"dev", "uji"}}
    kelompok = {}
    for r in rows:
        if r["id"] in hasil:
            continue
        kelompok.setdefault((r["label_isi"], r["sumber"]), []).append(r["id"])
    for ids in kelompok.values():
        ids.sort(key=lambda i: hashlib.md5(i.encode("utf-8")).hexdigest())
        separuh = (len(ids) + 1) // 2
        for k, i in enumerate(ids):
            hasil[i] = "dev" if k < separuh else "uji"
    return hasil


# ── Cache hasil per audio ────────────────────────────────────────

def path_cache(id_: str) -> Path:
    return FOLDER_CACHE / (re.sub(r"[^\w.-]", "_", id_) + ".json")


def muat_cache(id_: str):
    p = path_cache(id_)
    if not p.exists():
        return None
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return None


def simpan_cache(id_: str, data: dict):
    FOLDER_CACHE.mkdir(parents=True, exist_ok=True)
    path_cache(id_).write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")


def cache_lengkap(c) -> bool:
    return bool(c) and bool(c.get("transkrip")) and bool(c.get("aturan")) and c.get("llm") is not None


# ── Tahap 1: jalankan ────────────────────────────────────────────

def cmd_jalankan(a):
    rows = baca_label(Path(a.label))
    perlu = [r for r in rows if a.paksa or not cache_lengkap(muat_cache(r["id"]))]
    print(f"Total {len(rows)} audio | sudah lengkap di cache: {len(rows) - len(perlu)} | perlu diproses: {len(perlu)}")
    if a.batas:
        perlu = perlu[: a.batas]
        print(f"Dibatasi {len(perlu)} audio pada jalan ini (--batas {a.batas}).")
    if not perlu:
        print("Tidak ada yang perlu diproses. Lanjut ke: evaluasi_isi.py hitung")
        return

    selesai = gagal = 0
    try:
        for n, r in enumerate(perlu, start=1):
            print(f"[{n}/{len(perlu)}] {r['id']} ...", end=" ", flush=True)
            if not Path(r["path"]).exists():
                print("GAGAL: file tidak ditemukan")
                gagal += 1
                continue

            c = None if a.paksa else muat_cache(r["id"])
            c = c or {}
            memanggil_api = False
            try:
                # transkripsi (dipakai ulang kalau sudah ada)
                if not c.get("transkrip"):
                    transkrip = transkripsi(r["path"])
                    c["transkrip"] = transkrip
                    memanggil_api = True
                transkrip = c["transkrip"]
                c.update({"id": r["id"], "path": r["path"], "durasi_detik": transkrip.get("durasi_detik")})

                # aturan pola (cepat, lokal)
                t0 = time.perf_counter()
                aturan = analisis_aturan(transkrip)
                aturan["waktu_detik"] = round(time.perf_counter() - t0, 4)
                c["aturan"] = aturan

                # Gemini
                c["llm"], c["llm_error"] = None, None
                memanggil_api = True
                try:
                    c["llm"] = analisis_llm(transkrip)
                except AnalisisLLMError as e:
                    c["llm_error"] = str(e)
                simpan_cache(r["id"], c)

                if c["llm"] is None:
                    print(f"Gemini gagal: {c['llm_error']}")
                    gagal += 1
                    if "kuota" in c["llm_error"].lower():
                        print("\nKuota Gemini habis. Hasil yang sudah ada tersimpan. Lanjutkan lagi nanti.")
                        break
                else:
                    selesai += 1
                    print(f"benar={r['label_isi']:<9} aturan={aturan['label']}({aturan['skor']}) "
                          f"Gemini={c['llm']['label']}({c['llm']['skor']})")
            except TranskripsiError as e:
                print(f"GAGAL transkripsi: {e}")
                gagal += 1
                if "kuota" in str(e).lower():
                    print("\nKuota Groq habis. Hasil yang sudah ada tersimpan. Lanjutkan lagi nanti.")
                    break
            if memanggil_api and n < len(perlu):
                time.sleep(a.jeda)
    except KeyboardInterrupt:
        print("\nDihentikan. Hasil yang sudah selesai tetap tersimpan.")

    print(f"\nSelesai pada jalan ini: {selesai} | gagal atau terhenti: {gagal}")
    print("Cek jumlahnya dengan: evaluasi_isi.py status   |   hitung: evaluasi_isi.py hitung")


def cmd_status(a):
    rows = baca_label(Path(a.label))
    lengkap = sum(1 for r in rows if cache_lengkap(muat_cache(r["id"])))
    sebagian = sum(1 for r in rows if muat_cache(r["id"]) and not cache_lengkap(muat_cache(r["id"])))
    print(f"label_uji.csv : {len(rows)} audio")
    print(f"Lengkap       : {lengkap}")
    print(f"Sebagian      : {sebagian} (transkripsi ada, Gemini belum)")
    print(f"Belum diproses: {len(rows) - lengkap - sebagian}")
    kel = {}
    for r in rows:
        k = (r["label_isi"], r["jenis_suara"], r["sumber"])
        kel[k] = kel.get(k, 0) + 1
    print("\nPer kelompok:")
    for (li, js, sm), n in sorted(kel.items()):
        print(f"  isi={li:<9} suara={js:<9} sumber={sm:<12} : {n}")


# ── Penggabungan skor (cermin dari scam_analyzer.analisis_audio) ─

def label_dari_skor(skor, ambang_pen, ambang_men):
    if skor >= ambang_pen:
        return "penipuan"
    if skor >= ambang_men:
        return "mencurigakan"
    return "aman"


def gabungkan(aturan, llm, bobot_llm=BOBOT_LLM, ambang_pen=AMBANG_PENIPUAN,
              ambang_men=AMBANG_MENCURIGAKAN, gerbang=True):
    """Label isi gabungan. Urutan langkahnya sama dengan scam_analyzer.analisis_audio."""
    if llm is None:
        skor = aturan["skor"]
    else:
        skor = round(bobot_llm * llm["skor"] + (1 - bobot_llm) * aturan["skor"])
    label = label_dari_skor(skor, ambang_pen, ambang_men)

    if gerbang and llm is not None:
        minta_llm = llm.get("ada_permintaan")
        minta_aturan = bool(set(aturan["kategori_terdeteksi"]) & KATEGORI_PERMINTAAN)
        if minta_llm is False and not minta_aturan and label != "aman":
            label = "aman"

    if aturan["ada_indikator_kritis"] and label == "aman":
        label = "mencurigakan"
    return label


# ── Metrik ───────────────────────────────────────────────────────

def metrik(pasangan):
    """pasangan: daftar (benar_positif, prediksi_positif). Positif = penipuan."""
    tp = sum(1 for b, p in pasangan if b and p)
    fp = sum(1 for b, p in pasangan if not b and p)
    fn = sum(1 for b, p in pasangan if b and not p)
    tn = sum(1 for b, p in pasangan if not b and not p)
    prec = tp / (tp + fp) if (tp + fp) else None
    rec = tp / (tp + fn) if (tp + fn) else None
    if prec is None or rec is None:
        f1 = None
    elif prec + rec == 0:
        f1 = 0.0
    else:
        f1 = 2 * prec * rec / (prec + rec)
    n = tp + fp + fn + tn
    return {"tp": tp, "fp": fp, "fn": fn, "tn": tn, "n": n,
            "presisi": prec, "recall": rec, "f1": f1, "akurasi": (tp + tn) / n if n else None}


def persen(x):
    return "-" if x is None else f"{x * 100:.1f}%"


def positif(label, mode):
    return label == "penipuan" if mode == "ketat" else label in {"penipuan", "mencurigakan"}


def tabel(header, baris):
    out = ["| " + " | ".join(header) + " |", "|" + "|".join(["---"] * len(header)) + "|"]
    for b in baris:
        out.append("| " + " | ".join(str(x) for x in b) + " |")
    return "\n".join(out)


def tabel_metode(recs, metode, mode):
    baris = []
    for nama, fn in metode:
        m = metrik([(r["benar_pos"], positif(fn(r), mode)) for r in recs])
        baris.append([nama, m["tp"], m["fp"], m["fn"], m["tn"],
                      persen(m["presisi"]), persen(m["recall"]), persen(m["f1"]), persen(m["akurasi"])])
    return tabel(["Metode", "TP", "FP", "FN", "TN", "Presisi", "Recall", "F1", "Akurasi"], baris)


# ── WER ──────────────────────────────────────────────────────────

def normalisasi_wer(teks: str) -> list[str]:
    t = re.sub(r"[^\w\s]", " ", (teks or "").lower())
    return t.split()


def wer(acuan: str, hasil: str):
    """Word Error Rate = (substitusi + hapus + sisip) / jumlah kata acuan. None bila acuan kosong."""
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


# ── Penyetelan bobot dan ambang ──────────────────────────────────

def cari_penyetelan(recs):
    """Cari (bobot_llm, ambang_penipuan, ambang_mencurigakan) dengan F1 'ketat' terbaik pada recs."""
    kandidat = []
    for w10 in range(0, 11):
        w = w10 / 10
        for pen in range(40, 85, 5):
            for men in range(15, 45, 5):
                if men >= pen:
                    continue
                pas = [(r["benar_pos"], gabungkan(r["aturan"], r["llm"], w, pen, men, True) == "penipuan")
                       for r in recs]
                f1 = metrik(pas)["f1"]
                f1 = -1.0 if f1 is None else f1
                jarak = abs(w - BOBOT_LLM) + abs(pen - AMBANG_PENIPUAN) / 100 + abs(men - AMBANG_MENCURIGAKAN) / 100
                kandidat.append((-f1, jarak, w, pen, men))
    kandidat.sort()
    _, _, w, pen, men = kandidat[0]
    return w, pen, men


# ── Tahap 2: hitung ──────────────────────────────────────────────

def muat_rekaman(rows):
    bagian = tetapkan_bagian(rows)
    lengkap, belum = [], []
    for r in rows:
        c = muat_cache(r["id"])
        if not cache_lengkap(c):
            belum.append(r["id"])
            continue
        lengkap.append({**r, "bagian_pakai": bagian[r["id"]], "benar_pos": r["label_isi"] == "penipuan",
                        "aturan": c["aturan"], "llm": c["llm"], "transkrip": c["transkrip"]})
    return lengkap, belum


def cmd_hitung(a):
    rows = baca_label(Path(a.label))
    recs, belum = muat_rekaman(rows)
    if not recs:
        sys.exit("Belum ada hasil di cache. Jalankan dulu: evaluasi_isi.py jalankan")

    md = []
    md.append("# Laporan evaluasi analisis isi audio\n")
    md.append(f"Audio dievaluasi: **{len(recs)}** dari {len(rows)} di label_uji.csv "
              f"(belum diproses atau Gemini gagal: {len(belum)}).\n")
    n_pen = sum(1 for r in recs if r["benar_pos"])
    md.append(f"Jawaban benar: {n_pen} penipuan, {len(recs) - n_pen} bukan penipuan. "
              f"Positif = penipuan.\n")

    # 1. Rincian data
    kel = {}
    for r in recs:
        k = (r["sumber"] or "-", r["label_isi"], r["jenis_suara"])
        kel.setdefault(k, {"dev": 0, "uji": 0})[r["bagian_pakai"]] += 1
    md.append("## 1. Data yang dievaluasi\n")
    md.append(tabel(["Sumber", "Isi benar", "Suara", "Data dev", "Data uji"],
                    [[s, li, js, v["dev"], v["uji"]] for (s, li, js), v in sorted(kel.items())]))
    md.append("")

    # 2. Perbandingan metode
    metode = [
        ("Aturan saja", lambda r: r["aturan"]["label"]),
        ("Gemini saja", lambda r: r["llm"]["label"]),
        ("Gabungan tanpa gerbang", lambda r: gabungkan(r["aturan"], r["llm"], gerbang=False)),
        ("Gabungan + gerbang (sistem sekarang)", lambda r: gabungkan(r["aturan"], r["llm"], gerbang=True)),
    ]
    md.append("## 2. Perbandingan metode (semua data)\n")
    md.append("**Ketat**: hanya label *penipuan* dihitung positif. *Mencurigakan* dianggap bukan penipuan.\n")
    md.append(tabel_metode(recs, metode, "ketat"))
    md.append("\n**Longgar**: *penipuan* dan *mencurigakan* sama-sama dihitung positif.\n")
    md.append(tabel_metode(recs, metode, "longgar"))
    md.append("\nTP = penipuan terdeteksi, FP = bukan penipuan salah dituduh, "
              "FN = penipuan terlewat, TN = bukan penipuan benar.\n")

    # 3. Confusion matrix sistem sekarang
    sistem = metode[-1][1]
    cm = {}
    for r in recs:
        cm[(r["label_isi"], sistem(r))] = cm.get((r["label_isi"], sistem(r)), 0) + 1
    md.append("## 3. Confusion matrix sistem sekarang (gabungan + gerbang)\n")
    md.append(tabel(["Jawaban benar \\ Prediksi", "penipuan", "mencurigakan", "aman"],
                    [[b] + [cm.get((b, p), 0) for p in ("penipuan", "mencurigakan", "aman")]
                     for b in ("penipuan", "aman")]))
    md.append("")

    # 4. Per sumber
    md.append("## 4. Hasil sistem sekarang per sumber\n")
    baris = []
    for s in sorted({r["sumber"] or "-" for r in recs}):
        sub = [r for r in recs if (r["sumber"] or "-") == s]
        for li in ("penipuan", "aman"):
            ss = [r for r in sub if r["label_isi"] == li]
            if not ss:
                continue
            benar = sum(1 for r in ss if sistem(r) == li)
            ragu = sum(1 for r in ss if sistem(r) == "mencurigakan")
            baris.append([s, li, len(ss), benar, persen(benar / len(ss)), ragu])
    md.append(tabel(["Sumber", "Isi benar", "Jumlah", "Prediksi tepat", "Tepat (%)", "Dinilai mencurigakan"], baris))
    md.append("")

    # 5. Penyetelan
    md.append("## 5. Penyetelan bobot dan ambang\n")
    dev = [r for r in recs if r["bagian_pakai"] == "dev"]
    uji = [r for r in recs if r["bagian_pakai"] == "uji"]

    def kelas(rs):
        return sum(1 for r in rs if r["benar_pos"]), sum(1 for r in rs if not r["benar_pos"])

    dp, dn = kelas(dev)
    up, un = kelas(uji)
    md.append(f"Data pengembangan (dev): {dp} penipuan + {dn} bukan | data uji: {up} penipuan + {un} bukan.\n")
    if dp == 0 or dn == 0:
        md.append("Penyetelan dilewati: data dev harus memuat penipuan dan bukan penipuan.\n")
    else:
        if min(dp, dn) < 10 or min(up, un) < 10:
            md.append("> PERINGATAN: salah satu kelas kurang dari 10 audio. Hasil penyetelan di bawah "
                      "baru contoh dan jangan dipakai sebagai angka akhir di laporan.\n")
        w, pen, men = cari_penyetelan(dev)
        awal = (BOBOT_LLM, AMBANG_PENIPUAN, AMBANG_MENCURIGAKAN)
        baris = []
        for nama, (w_, p_, m_) in (("Nilai awal", awal), ("Terpilih dari data dev", (w, pen, men))):
            row = [nama, f"{w_:.1f} / {1 - w_:.1f}", f"{p_} / {m_}"]
            for himpunan in (dev, uji):
                if himpunan:
                    mm = metrik([(r["benar_pos"], gabungkan(r["aturan"], r["llm"], w_, p_, m_, True) == "penipuan")
                                 for r in himpunan])
                    row += [persen(mm["f1"]), persen(mm["recall"])]
                else:
                    row += ["-", "-"]
            baris.append(row)
        md.append(tabel(["Pengaturan", "Bobot Gemini / aturan", "Ambang penipuan / mencurigakan",
                         "F1 dev", "Recall dev", "F1 uji", "Recall uji"], baris))
        md.append("\nPenyetelan memakai F1 ketat pada data dev saja. Nilai yang benar-benar menentukan "
                  "adalah kolom **uji**: kalau pengaturan terpilih tidak lebih baik di data uji, "
                  "pertahankan nilai awal.\n")

    # 6. WER
    md.append("## 6. WER transkripsi\n")
    wers = []
    for r in recs:
        if r["teks_acuan"]:
            w_ = wer(r["teks_acuan"], r["transkrip"].get("teks", ""))
            if w_ is not None:
                wers.append((r["sumber"] or "-", w_))
    if not wers:
        md.append("Belum ada audio dengan kolom teks_acuan terisi, jadi WER belum dihitung.\n")
    else:
        baris = [["semua", len(wers), persen(statistics.mean(x for _, x in wers)),
                  persen(statistics.median(x for _, x in wers))]]
        for s in sorted({s for s, _ in wers}):
            xs = [x for ss, x in wers if ss == s]
            baris.append([s, len(xs), persen(statistics.mean(xs)), persen(statistics.median(xs))])
        md.append(tabel(["Kelompok", "Jumlah audio", "WER rata-rata", "WER tengah"], baris))
        md.append("\nWER = (kata salah ganti + hilang + tambahan) dibagi jumlah kata acuan. Makin kecil makin baik.\n")

    # 7. Waktu
    md.append("## 7. Waktu proses per audio (detik)\n")

    def ringkas(xs):
        xs = [x for x in xs if x is not None]
        return [f"{statistics.mean(xs):.2f}", f"{statistics.median(xs):.2f}", f"{max(xs):.2f}"] if xs else ["-"] * 3

    md.append(tabel(["Tahap", "Rata-rata", "Tengah", "Terlama"], [
        ["Durasi audio"] + ringkas([r["transkrip"].get("durasi_detik") for r in recs]),
        ["Transkripsi (Groq)"] + ringkas([r["transkrip"].get("waktu_proses_detik") for r in recs]),
        ["Aturan pola"] + ringkas([r["aturan"].get("waktu_detik") for r in recs]),
        ["Gemini"] + ringkas([r["llm"].get("waktu_proses_detik") for r in recs]),
    ]))
    md.append("\nWaktu deteksi suara (AASIST) tidak termasuk. Ukur dengan uji_suara_folder.py.\n")

    # 8. Kesalahan
    md.append("## 8. Audio yang dinilai tidak tepat oleh sistem sekarang\n")
    salah = [r for r in recs if sistem(r) != r["label_isi"]]
    if not salah:
        md.append("Tidak ada. Semua prediksi sama dengan jawaban benar.\n")
    else:
        baris = []
        for r in salah:
            baris.append([r["id"], r["label_isi"], sistem(r), r["aturan"]["skor"], r["llm"]["skor"],
                          r["llm"].get("ada_permintaan"), (r["llm"].get("modus") or "")[:60]])
        md.append(tabel(["id", "Benar", "Prediksi", "Skor aturan", "Skor Gemini", "Ada permintaan (Gemini)", "Modus (Gemini)"],
                        baris))
        md.append("\nBuka cache\\<id>.json untuk membaca transkrip dan alasan Gemini pada audio yang salah.\n")

    # 9. Catatan
    md.append("## 9. Catatan membaca hasil\n")
    md.append("- Aturan pola dulu disetel memakai naskah yang sama dengan suara AI ELF/ELN, jadi angka aturan "
              "pada sumber itu terlalu bagus. Nilai yang adil ada pada sumber yang tidak dipakai menyetel "
              "(mis. mms, youtube).")
    md.append("- Prompt Gemini diperbaiki setelah melihat rekaman Jokowi dan Purbaya. Tandai keduanya "
              "sebagai bagian `dev`, bukan `uji`.")
    md.append("- Gemini bisa berbeda tipis antar panggilan walau temperature 0. Satu kali jalan belum "
              "mengukur konsistensi.")
    md.append("- Jumlah audio kecil membuat persentase kasar: satu audio salah mengubah angka banyak.")
    md.append("- Evaluasi ini hanya untuk analisis ISI. Akurasi deteksi suara diukur terpisah.\n")

    teks = "\n".join(md)
    FOLDER_HASIL.mkdir(parents=True, exist_ok=True)
    (FOLDER_HASIL / "laporan.md").write_text(teks, encoding="utf-8")

    with open(FOLDER_HASIL / "hasil_per_file.csv", "w", newline="", encoding="utf-8-sig") as f:
        w_ = csv.writer(f)
        w_.writerow(["id", "sumber", "bagian", "jenis_suara", "label_benar", "label_aturan", "skor_aturan",
                     "label_gemini", "skor_gemini", "ada_permintaan", "label_gabungan_gerbang",
                     "wer", "durasi_detik"])
        for r in recs:
            x = wer(r["teks_acuan"], r["transkrip"].get("teks", "")) if r["teks_acuan"] else None
            w_.writerow([r["id"], r["sumber"], r["bagian_pakai"], r["jenis_suara"], r["label_isi"],
                         r["aturan"]["label"], r["aturan"]["skor"], r["llm"]["label"], r["llm"]["skor"],
                         r["llm"].get("ada_permintaan"), sistem(r), "" if x is None else round(x, 4),
                         r["transkrip"].get("durasi_detik")])

    print(teks)
    print(f"\nLaporan disimpan: {FOLDER_HASIL / 'laporan.md'}")
    print(f"Tabel per file  : {FOLDER_HASIL / 'hasil_per_file.csv'}")


# ── Titik masuk ──────────────────────────────────────────────────

def main():
    ap = argparse.ArgumentParser(description="Evaluasi analisis isi audio")
    ap.add_argument("--label", default=str(FILE_LABEL))
    sub = ap.add_subparsers(dest="perintah", required=True)

    p1 = sub.add_parser("jalankan", help="proses audio (memakai Groq dan Gemini), simpan di cache")
    p1.add_argument("--batas", type=int, default=0)
    p1.add_argument("--jeda", type=float, default=6.0)
    p1.add_argument("--paksa", action="store_true")
    p1.set_defaults(fn=cmd_jalankan)

    p2 = sub.add_parser("hitung", help="hitung metrik dari cache (tanpa internet)")
    p2.set_defaults(fn=cmd_hitung)

    p3 = sub.add_parser("status", help="lihat berapa audio yang sudah diproses")
    p3.set_defaults(fn=cmd_status)

    a = ap.parse_args()
    a.fn(a)


if __name__ == "__main__":
    main()