"""
Mencocokkan naskah (skrip) rekaman manusia dengan audionya, lalu mengisi kolom teks_acuan.

Nama file WhatsApp tidak menunjukkan naskah mana yang dibacakan, jadi pencocokan dilakukan
dengan kemiripan antara transkrip Whisper dan tiap naskah. Hasilnya WAJIB Anda periksa.

Cara pakai (dari folder backend, venv aktif, PowerShell):

  1. Simpan naskah dalam satu file teks, mis. voice\\data_uji\\naskah\\naskah_manusia.txt
     Bentuk: satu naskah per paragraf (dipisah baris kosong), ATAU satu naskah per baris.
     Nomor di depan ("1.", "2)") akan diabaikan.

  2. Lihat dulu hasil pencocokan (belum mengubah apa pun):
       python voice\\scripts\\cocokkan_naskah.py voice\\data_uji\\naskah\\naskah_manusia.txt

  3. Jika sudah benar, simpan ke label_uji.csv dan lembar_wer.csv:
       python voice\\scripts\\cocokkan_naskah.py voice\\data_uji\\naskah\\naskah_manusia.txt --tulis

  4. Hitung WER:
       python voice\\scripts\\evaluasi_isi.py hitung

Catatan: pencocokan memakai kemiripan, jadi WER sedikit lebih optimis dibanding jika Anda
mencatat naskah per audio secara manual. Tandai pasangan yang kemiripannya rendah dan periksa.
"""
import argparse, csv, json, re, shutil, sys
from difflib import SequenceMatcher
from pathlib import Path

AKAR = Path(__file__).resolve().parent.parent  # backend/voice
CACHE = AKAR / "results" / "analisis_audio" / "evaluasi_isi" / "model_gemini-3.5-flash-lite" / "cache"
LABEL = AKAR / "data_uji" / "label_uji.csv"
LEMBAR = AKAR / "data_uji" / "lembar_wer.csv"
AMBANG_RENDAH = 0.60   # di bawah ini: jangan disimpan otomatis
AMBANG_SELISIH = 0.08  # selisih tipis dengan kandidat kedua: periksa manual


def kata(t):
    return re.findall(r"[a-z0-9]+", t.lower())


def sim(a, b):
    return SequenceMatcher(None, kata(a), kata(b), autojunk=False).ratio()


def baca_naskah(p):
    teks = Path(p).read_text(encoding="utf-8-sig").replace("\r\n", "\n").strip()
    blok = [b.strip() for b in re.split(r"\n\s*\n", teks) if b.strip()]
    if len(blok) < 3:                       # kemungkinan satu naskah per baris
        blok = [b.strip() for b in teks.split("\n") if b.strip()]
    hasil = []
    for b in blok:
        b = re.sub(r"^\s*(naskah\s*)?\(?\d+[.):\-]?\s*", "", b, flags=re.I)
        b = re.sub(r"\s+", " ", b).strip()
        if len(kata(b)) >= 5:
            hasil.append(b)
    return hasil


def baca_csv(p):
    with open(p, encoding="utf-8-sig", newline="") as f:
        r = csv.DictReader(f)
        return list(r), r.fieldnames


def tulis_csv(p, rows, kolom):
    with open(p, "w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=kolom, extrasaction="ignore")
        w.writeheader(); w.writerows(rows)


def main():
    ap = argparse.ArgumentParser(description="Cocokkan naskah manusia dengan audionya.")
    ap.add_argument("naskah")
    ap.add_argument("--awalan", default="manusia_penipuan", help="awalan id audio yang dicocokkan")
    ap.add_argument("--label", default=str(LABEL))
    ap.add_argument("--lembar", default=str(LEMBAR))
    ap.add_argument("--cache", default=str(CACHE))
    ap.add_argument("--tulis", action="store_true", help="simpan hasil ke CSV (bawaan: hanya tampilkan)")
    a = ap.parse_args()

    naskah = baca_naskah(a.naskah)
    rows, kolom = baca_csv(a.label)
    audio = [r for r in rows if r["id"].startswith(a.awalan)]
    if not audio:
        sys.exit(f"Tidak ada audio berawalan '{a.awalan}' di {a.label}")

    trans = {}
    for r in audio:
        f = Path(a.cache) / f"{r['id']}.json"
        if not f.exists():
            sys.exit(f"Transkrip belum ada di cache: {f.name}. Jalankan evaluasi_isi.py jalankan dulu.")
        trans[r["id"]] = json.loads(f.read_text(encoding="utf-8"))["transkrip"]["teks"]

    print(f"Naskah terbaca: {len(naskah)} | audio: {len(audio)}")
    if len(naskah) < len(audio):
        print("PERINGATAN: naskah lebih sedikit dari audio, sebagian audio tidak akan punya pasangan.")

    S = {(r["id"], j): sim(naskah[j], trans[r["id"]]) for r in audio for j in range(len(naskah))}
    pasang, pakai_a, pakai_n = {}, set(), set()
    for (i, j), s in sorted(S.items(), key=lambda x: -x[1]):   # serakah: kemiripan tertinggi dulu
        if i not in pakai_a and j not in pakai_n:
            pasang[i] = (j, s); pakai_a.add(i); pakai_n.add(j)

    print(f"\n{'audio':<22}{'mirip':>7}  {'catatan':<26} naskah  <->  transkrip")
    perlu_cek, simpan = 0, {}
    for r in audio:
        i = r["id"]; short = re.sub(r".*at_", "", i)
        if i not in pasang:
            print(f"{short:<22}{'-':>7}  TANPA PASANGAN"); perlu_cek += 1; continue
        j, s = pasang[i]
        lain = sorted((S[(i, k)] for k in range(len(naskah)) if k != j), reverse=True)
        selisih = s - (lain[0] if lain else 0)
        cat = []
        if s < AMBANG_RENDAH: cat.append("MIRIP RENDAH")
        if selisih < AMBANG_SELISIH: cat.append("ragu (kandidat lain dekat)")
        if cat: perlu_cek += 1
        else: simpan[i] = naskah[j]
        print(f"{short:<22}{s:>6.0%}  {', '.join(cat) or 'ok':<26} {naskah[j][:48]!r}\n{'':<22}{'':>7}  {'':<26} {trans[i][:48]!r}")
    sisa = [naskah[j][:50] for j in range(len(naskah)) if j not in pakai_n]
    if sisa: print("\nNaskah yang tidak terpakai:", *sisa, sep="\n  - ")
    print(f"\nPasangan otomatis yang yakin: {len(simpan)} dari {len(audio)} | perlu dicek manual: {perlu_cek}")

    if not a.tulis:
        print("\n(Belum ada yang disimpan. Jika sudah benar, ulangi dengan --tulis.)"); return
    cad = Path(a.label).with_name("label_uji_cadangan_sebelum_naskah_manusia.csv")
    if not cad.exists(): shutil.copy(a.label, cad); print("Cadangan label:", cad.name)
    for r in rows:
        if r["id"] in simpan: r["teks_acuan"] = simpan[r["id"]]
    tulis_csv(a.label, rows, kolom)
    lr, lk = baca_csv(a.lembar)
    for r in lr:
        if r["id"] in simpan: r["teks_acuan"] = simpan[r["id"]]
    tulis_csv(a.lembar, lr, lk)
    print(f"Tersimpan: {len(simpan)} teks_acuan di label_uji.csv dan lembar_wer.csv.")


if __name__ == "__main__":
    main()
