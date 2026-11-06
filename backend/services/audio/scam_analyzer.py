"""
Tugas B - Tahap 5: Penggabung seluruh alur analisis audio

Urutan (sesuai alur yang disepakati, satu kali upload):
  1. Deteksi suara   : asli atau sintetis (XLS-R + AASIST milik tim)
  2. Transkripsi     : audio -> teks (Groq Whisper)
  3. Aturan pola     : indikator penipuan di teks (scam_rules.py)
  4. Analisis LLM    : penilaian isi oleh Gemini (scam_llm.py)
  5. Kesimpulan      : gabungan suara + isi -> tingkat risiko

Prinsip:
  - Setiap bagian boleh gagal tanpa menjatuhkan seluruh hasil
    (mis. kuota Gemini habis -> tetap ada hasil dari aturan).
  - Pendeteksi suara DIKIRIM dari luar (fungsi periksa_suara), supaya modul ini
    tidak bergantung pada torch dan mudah diuji.
  - Bobot dan ambang di bawah bersifat AWAL; nilai akhirnya ditentukan dari
    hasil evaluasi pada data uji (tahap 8).
"""

import time

from .materi import rekomendasi
from .scam_llm import AnalisisLLMError, analisis_llm
from .scam_rules import analisis_aturan
from .transcriber import MODEL_DEFAULT, TranskripsiError, transkripsi

# ── Pengaturan awal (disetel ulang setelah evaluasi) ─────────────

BOBOT_LLM = 0.6
BOBOT_ATURAN = 0.4
AMBANG_PENIPUAN = 60
AMBANG_MENCURIGAKAN = 30
DETIK_ANALISIS_SUARA = 30        # pendeteksi suara hanya membaca 30 detik pertama

# "Gerbang permintaan": penipuan selalu meminta/menekan pendengar. Jika Gemini menilai TIDAK ADA
# permintaan berisiko dan aturan pola juga tidak menemukan ciri permintaan di bawah ini, isi tidak
# boleh berlabel mencurigakan/penipuan (mis. pidato atau berita yang hanya menyebut pejabat/laporan).
# Kategori "mengaku_pihak_resmi", "desakan_waktu", "iming_iming", dan "darurat_keluarga" sengaja tidak
# termasuk: sendirian, semuanya bisa muncul di percakapan biasa.
KATEGORI_PERMINTAAN = {
    "minta_data_rahasia", "instal_aplikasi_atau_link", "perintah_transfer", "isolasi_korban", "ancaman",
}
SKOR_MAKS_TANPA_PERMINTAAN = AMBANG_MENCURIGAKAN - 1

# Tingkat risiko = gabungan label isi percakapan x hasil deteksi suara.
# Suara sintetis SAJA bukan penipuan (banyak suara AI yang sah, misalnya asisten
# suara), tetapi suara sintetis + isi menipu adalah kombinasi paling berbahaya.
MATRIKS_RISIKO = {
    #               sintetis        asli         tidak diketahui
    "penipuan":     ("sangat tinggi", "tinggi",  "tinggi"),
    "mencurigakan": ("tinggi",        "sedang",  "sedang"),
    "aman":         ("rendah",        "rendah",  "rendah"),
}

SARAN_DEFAULT = {
    "penipuan": "Jangan ikuti permintaan penelepon. Jangan berikan OTP, PIN, atau transfer uang. "
                "Akhiri panggilan, lalu hubungi lembaga terkait lewat nomor resminya. "
                "Laporkan ke iasc.ojk.go.id atau Kontak OJK 157.",
    "mencurigakan": "Berhati-hatilah. Jangan berikan data pribadi atau uang sebelum identitas penelepon "
                    "diverifikasi lewat nomor resmi lembaga yang bersangkutan.",
    "aman": "Tidak ditemukan tanda penipuan pada isi percakapan.",
}


class AnalisisAudioError(Exception):
    """Tidak ada satu pun bagian yang berhasil dianalisis."""


def _label_dari_skor(skor: int) -> str:
    if skor >= AMBANG_PENIPUAN:
        return "penipuan"
    if skor >= AMBANG_MENCURIGAKAN:
        return "mencurigakan"
    return "aman"


def _tingkat_risiko(label_isi: str, label_suara: str | None) -> str:
    kolom = {"sintetis": 0, "asli": 1}.get(label_suara, 2)
    return MATRIKS_RISIKO[label_isi][kolom]


def _ringkasan(label_isi: str, label_suara: str | None, modus: str, isi_ada: bool) -> str:
    bagian = []
    if label_suara == "sintetis":
        bagian.append("Suara terindikasi sintetis (kemungkinan dibuat AI)")
    elif label_suara == "asli":
        bagian.append("Suara terindikasi asli (rekaman suara manusia)")
    if isi_ada:
        if label_isi == "penipuan":
            bagian.append(f"isi percakapan mengarah ke penipuan ({modus})")
        elif label_isi == "mencurigakan":
            bagian.append(f"isi percakapan mencurigakan ({modus})")
        else:
            bagian.append("isi percakapan tampak wajar")
    teks = "; ".join(bagian)
    return (teks[0].upper() + teks[1:] + ".") if teks else "Tidak ada hasil."


# ── Fungsi utama ─────────────────────────────────────────────────

def analisis_audio(path_audio, periksa_suara=None, model_asr: str = MODEL_DEFAULT) -> dict:
    """
    path_audio    : file audio.
    periksa_suara : fungsi(path) -> dict hasil pendeteksi suara, atau None untuk melewati.
    """
    mulai = time.perf_counter()
    catatan = []

    # 1. Deteksi suara (AI atau manusia)
    suara = {"tersedia": False}
    if periksa_suara is not None:
        try:
            h = periksa_suara(str(path_audio))
            suara = {
                "tersedia": True,
                "label": h["label"],
                "skor_asli": h["skor_asli"],
                "ambang": h["ambang"],
                "jumlah_segmen": h["jumlah_segmen"],
                "catatan": h.get("catatan", ""),
            }
        except Exception as e:
            suara = {"tersedia": False, "error": f"Deteksi suara gagal ({type(e).__name__})."}
            catatan.append("Deteksi suara tidak berhasil; kesimpulan hanya berdasarkan isi percakapan.")

    # 2. Transkripsi
    transkrip, isi = None, {"tersedia": False}
    try:
        transkrip = transkripsi(path_audio, model=model_asr)
    except TranskripsiError as e:
        isi = {"tersedia": False, "error": str(e)}
        if not suara["tersedia"]:
            raise AnalisisAudioError(str(e))
        catatan.append("Isi percakapan tidak bisa dianalisis; kesimpulan hanya berdasarkan suara.")

    if transkrip is not None:
        if transkrip["durasi_detik"] > DETIK_ANALISIS_SUARA and suara.get("tersedia"):
            catatan.append(
                f"Deteksi suara hanya membaca {DETIK_ANALISIS_SUARA} detik pertama dari "
                f"{transkrip['durasi_detik']:.0f} detik audio; analisis isi membaca seluruhnya."
            )
        if transkrip["jumlah_ragu"]:
            catatan.append(
                f"{transkrip['jumlah_ragu']} potongan transkrip kurang yakin (kualitas audio rendah)."
            )

        # 3. Aturan pola penipuan
        aturan = analisis_aturan(transkrip)

        # 4. Analisis LLM (boleh gagal)
        llm, llm_error = None, None
        try:
            llm = analisis_llm(transkrip)
        except AnalisisLLMError as e:
            llm_error = str(e)
            catatan.append(f"Analisis Gemini tidak tersedia ({llm_error}); memakai aturan pola saja.")

        # 5a. Gabungkan skor isi
        if llm:
            skor = round(BOBOT_LLM * llm["skor"] + BOBOT_ATURAN * aturan["skor"])
            metode = "gabungan aturan + Gemini"
        else:
            skor = aturan["skor"]
            metode = "aturan saja"
        label = _label_dari_skor(skor)

        # Gerbang permintaan: turun ke "aman" hanya jika Gemini DAN aturan sama-sama tidak menemukan permintaan
        ada_permintaan_llm = llm.get("ada_permintaan") if llm else None
        aturan_minta = bool(set(aturan["kategori_terdeteksi"]) & KATEGORI_PERMINTAAN)
        diturunkan = False
        if ada_permintaan_llm is False and not aturan_minta and label != "aman":
            label = "aman"
            skor = min(skor, SKOR_MAKS_TANPA_PERMINTAAN)
            diturunkan = True
            catatan.append("Tidak ada permintaan atau tekanan kepada pendengar, jadi isi dinilai wajar.")

        # Pengaman: indikator kritis (OTP/PIN, instal APK, rahasiakan) minimal "mencurigakan"
        if aturan["ada_indikator_kritis"] and label == "aman":
            label = "mencurigakan"
            catatan.append("Ada indikator kritis (mis. permintaan OTP/PIN); label dinaikkan menjadi mencurigakan.")

        # Bukti: pilih kutipan dari Gemini yang sudah diverifikasi, jika tidak ada pakai temuan aturan
        if llm and llm["bukti"]:
            bukti = [{"kutipan": b["kutipan"], "mulai": b["mulai"], "sumber": "gemini"} for b in llm["bukti"]]
        else:
            bukti = [{"kutipan": t["kutipan"], "mulai": t["mulai"], "sumber": "aturan"} for t in aturan["temuan"]]

        isi = {
            "tersedia": True,
            "label": label,
            "skor": skor,
            "metode": metode,
            "modus": (llm["modus"] if llm else (aturan["temuan"][0]["deskripsi"] if aturan["temuan"] else "tidak ada")),
            "alasan": llm["alasan"] if llm else "",
            "bukti": bukti,
            "skor_aturan": aturan["skor"],
            "label_aturan": aturan["label"],
            "temuan_aturan": aturan["temuan"],
            "skor_llm": llm["skor"] if llm else None,
            "label_llm": llm["label"] if llm else None,
            "llm_error": llm_error,
            "bukti_terverifikasi": llm["bukti_terverifikasi"] if llm else None,
            "jenis_rekaman": llm.get("jenis_rekaman") if llm else None,
            "ada_permintaan": ada_permintaan_llm,
            "permintaan": llm.get("permintaan") if llm else None,
            "diturunkan_gerbang": diturunkan,
        }

    # 5b. Kesimpulan akhir
    label_suara = suara.get("label") if suara["tersedia"] else None
    if isi["tersedia"]:
        tingkat = _tingkat_risiko(isi["label"], label_suara)
        ringkasan = _ringkasan(isi["label"], label_suara, isi["modus"], True)
        saran = (llm["saran"] if (transkrip is not None and llm and llm["saran"]) else SARAN_DEFAULT[isi["label"]])
    else:
        # hanya hasil suara
        # Isi tidak diketahui: suara asli BUKAN bukti aman, jadi jangan diberi "rendah"
        tingkat = "sedang" if label_suara == "sintetis" else "tidak dapat ditentukan"
        ringkasan = _ringkasan("aman", label_suara, "", False)
        saran = "Isi percakapan belum bisa dianalisis. Jangan berikan data atau uang sebelum identitas penelepon terverifikasi."

    # 5c. Materi pembelajaran yang cocok dengan isi audio
    materi = rekomendasi(
        llm.get("materi") if (transkrip is not None and llm) else None,
        isi.get("temuan_aturan") if isi["tersedia"] else None,
        isi["label"] if isi["tersedia"] else None,
        label_suara,
    )

    return {
        "tingkat_risiko": tingkat,
        "ringkasan": ringkasan,
        "saran": saran,
        "suara": suara,
        "isi": isi,
        "rekomendasi_materi": materi,
        "transkrip": None if transkrip is None else {
            "teks": transkrip["teks"],
            "potongan": transkrip["potongan"],
            "durasi_detik": transkrip["durasi_detik"],
            "model": transkrip["model"],
            "waktu_proses_detik": transkrip["waktu_proses_detik"],
        },
        "catatan": catatan,
        "waktu_proses_detik": round(time.perf_counter() - mulai, 2),
    }