r"""
Uji otomatis fitur Verifikasi Link (CyberGuard AI).

Skrip ini memasukkan setiap link ke fungsi yang sama dengan yang dipakai halaman
Verifikasi (deskripsikan_link), lalu mencocokkan hasilnya dengan:
  1. kunci jawaban (jenis situs yang sebenarnya, ditulis manual di daftar LINK_UJI),
  2. jawaban yang seharusnya keluar menurut aturan kode,
  3. WHOIS (sumber pembanding untuk tanggal pendaftaran domain),
  4. ipinfo.io (sumber pembanding untuk negara server).

Cara pakai (PowerShell, dari folder backend, venv aktif):
    python uji_otomatis_verifikasi.py

Hasil: tabel di layar dan file hasil_uji_verifikasi.csv di folder backend.
Screenshot sengaja dimatikan saat uji supaya cepat dan kuota Microlink tidak terpakai.
"""
import asyncio
import csv
import re
import socket
import sys
import time
from datetime import date, datetime

import requests
from dateutil import parser as date_parser

from services.threat import link_info

BELUM = "Jenis situs belum dikenali (tidak ditemukan ciri khusus)"
BEBAS = "*"   # teks jenis situs tidak dicek, karena bergantung pada keterangan yang ditulis situs itu sendiri

# (no, link, kelompok, jenis sebenarnya, kode kunci, seharusnya tampil, cek link pendek)
#   kode kunci : jenis yang benar dalam bahasa sistem. "lain" = jenis yang tidak dimiliki sistem,
#                jadi kalau sistem menyebut jenis apa pun untuk link itu, hitungannya Salah.
#   seharusnya : teks "Jenis Situs" yang seharusnya keluar menurut aturan kode.
#                None = link tidak bisa dijangkau. BEBAS = tidak dicek (hasilnya tetap dinilai lewat kode kunci).
#   cek pendek : True = harus terdeteksi link pendek, False = tidak boleh, None = tidak dicek.
LINK_UJI = [
    (1, "https://www.google.com", "Situs populer", "Mesin pencari", "resmi", "Layanan internet resmi", False),
    (2, "https://id.wikipedia.org", "Situs populer", "Ensiklopedia", "resmi", "Layanan internet resmi", False),
    (3, "https://www.detik.com", "Situs populer", "Situs berita", "resmi", "Situs berita resmi", False),
    (4, "https://www.kompas.com", "Situs populer", "Situs berita", "resmi", "Situs berita resmi", False),
    (5, "https://www.tokopedia.com", "Situs populer", "Toko online", "resmi", "Toko online (e-commerce) resmi", False),
    (6, "https://shopee.co.id", "Situs populer", "Toko online", "resmi", "Toko online (e-commerce) resmi", False),
    (7, "https://www.bca.co.id", "Situs populer", "Bank", "resmi", "Bank resmi", False),
    (8, "https://www.youtube.com", "Situs populer", "Streaming video", "resmi", "Layanan streaming resmi", False),
    (9, "https://www.instagram.com", "Situs populer", "Media sosial", "resmi", "Media sosial resmi", False),
    (10, "https://www.gojek.com", "Situs populer", "Transportasi", "resmi", "Layanan transportasi dan perjalanan resmi", False),
    (11, "https://www.kemdikbud.go.id", "Pemerintah & pendidikan", "Situs pemerintah (tidak aktif)", "pemerintah", "Situs pemerintah (tidak bisa dibuka saat ini)", False),
    (12, "https://www.komdigi.go.id", "Pemerintah & pendidikan", "Situs pemerintah", "pemerintah", "Situs pemerintah", False),
    (13, "https://www.bps.go.id", "Pemerintah & pendidikan", "Situs pemerintah", "pemerintah", "Situs pemerintah", False),
    (14, "https://jakarta.go.id", "Pemerintah & pendidikan", "Situs pemerintah daerah", "pemerintah", "Situs pemerintah", False),
    (15, "https://www.ui.ac.id", "Pemerintah & pendidikan", "Kampus", "pendidikan", "Situs lembaga pendidikan", False),
    (16, "https://ugm.ac.id", "Pemerintah & pendidikan", "Kampus", "pendidikan", "Situs lembaga pendidikan", False),
    (17, "https://www.itb.ac.id", "Pemerintah & pendidikan", "Kampus", "pendidikan", "Situs lembaga pendidikan", False),
    (18, "https://binus.ac.id", "Pemerintah & pendidikan", "Kampus swasta", "pendidikan", "Situs lembaga pendidikan", False),
    (19, "https://adinusa.id", "Di luar daftar", "Platform kursus", "pendidikan_kursus", BEBAS, False),
    (20, "https://kumparan.com", "Di luar daftar", "Situs berita", "berita", BEBAS, False),
    (21, "https://www.tribunnews.com", "Di luar daftar", "Situs berita", "berita", BEBAS, False),
    (22, "https://www.dicoding.com", "Di luar daftar", "Platform kursus", "pendidikan_kursus", BEBAS, False),
    (23, "https://www.ruangguru.com", "Di luar daftar", "Bimbel online", "pendidikan_kursus", BEBAS, False),
    (24, "https://www.halodoc.com", "Di luar daftar", "Layanan kesehatan", "kesehatan", BEBAS, False),
    (25, "https://www.jne.co.id", "Di luar daftar", "Ekspedisi", "ekspedisi", BEBAS, False),
    (26, "https://www.pln.co.id", "Di luar daftar", "BUMN listrik", "lain", BEBAS, False),
    (27, "https://kai.id", "Di luar daftar", "BUMN kereta api", "transportasi", BEBAS, False),
    (28, "https://www.kompas.id", "Di luar daftar", "Situs berita", "berita", BEBAS, False),
    (29, "https://www.microsoft.com", "Uji link pendek", "Layanan internet", "resmi", "Layanan internet resmi", False),
    (30, "https://www.reddit.com", "Uji link pendek", "Forum", "forum", BEBAS, False),
    (31, "https://www.pinterest.com", "Uji link pendek", "Media sosial gambar", "lain", BEBAS, False),
    (34, "https://youtu.be/jNQXAC9IVRw", "Uji link pendek", "Streaming video", "resmi", "Layanan streaming resmi", True),
    (35, "https://cyberguard-uji-tidak-ada-123456.com", "Tidak bisa dijangkau", "Domain tidak ada", "lain", None, None),
]

# Link yang kamu tambahkan sendiri (No 32, 33, 36-40 di spreadsheet). Hapus tanda # lalu ganti link-nya.
LINK_TAMBAHAN = [
    # (32, "https://bit.ly/xxxx", "Uji link pendek", "Platform kursus", "pendidikan_kursus", BEBAS, True),
    # (33, "https://s.id/xxxx", "Uji link pendek", "Situs berita", "resmi", "Situs berita resmi", True),
    # (36, "https://contoh-situs-judi.com", "Judi / bajakan", "Judi online", "judi_online", "Situs judi online", None),
    # (39, "https://contoh-situs-bajakan.com", "Judi / bajakan", "Unduhan bajakan", "unduhan_bajakan",
    #      "Situs unduhan film, game, atau aplikasi bajakan", None),
]


# ------------------------------------------------------------------ sumber pembanding
def _tanya_whois(server: str, pertanyaan: str) -> str:
    """Kirim satu pertanyaan ke server WHOIS (port 43) dan kembalikan jawabannya."""
    with socket.create_connection((server, 43), timeout=10) as s:
        s.sendall((pertanyaan + "\r\n").encode())
        potongan = []
        while True:
            data = s.recv(4096)
            if not data:
                break
            potongan.append(data)
    return b"".join(potongan).decode("utf-8", errors="ignore")


POLA_TANGGAL_WHOIS = re.compile(
    r"^\s*(?:creation date|created date|created on|created|registered on|registration time|"
    r"domain registration date|registered)\s*:\s*(.+)$", re.IGNORECASE | re.MULTILINE)


def tanggal_whois(domain: str):
    """Tanggal pendaftaran dari WHOIS. Server WHOIS dicari lewat IANA sesuai akhiran domain."""
    akhiran = domain.rsplit(".", 1)[-1]
    data_iana = _tanya_whois("whois.iana.org", akhiran)
    m = re.search(r"^whois:\s*(\S+)", data_iana, re.IGNORECASE | re.MULTILINE)
    if not m:
        return None
    jawaban = _tanya_whois(m.group(1), domain)
    m = POLA_TANGGAL_WHOIS.search(jawaban)
    if not m:
        return None
    return date_parser.parse(m.group(1).strip(), fuzzy=True).date()


def negara_ipinfo(ip: str):
    r = requests.get(f"https://ipinfo.io/{ip}/json", timeout=10)
    return r.json().get("country")


# ------------------------------------------------------------------ penilaian
def nilai_jenis(hasil: dict, kode_kunci: str) -> str:
    kode = hasil.get("kode_jenis")
    if kode == "tidak_diketahui":
        return "Tidak terbaca"
    if kode == "umum":
        return "Belum dikenali"
    return "Benar" if kode == kode_kunci else "Salah"


def sesuai_harapan(hasil: dict, seharusnya, cek_pendek):
    alasan = []
    if seharusnya is None:
        if hasil.get("dapat_dijangkau"):
            alasan.append("seharusnya tidak bisa dijangkau")
    elif seharusnya == BEBAS:
        if not hasil.get("dapat_dijangkau"):
            alasan.append("situs seharusnya bisa dibuka")
    elif hasil.get("jenis_situs") != seharusnya:
        alasan.append(f"jenis seharusnya '{seharusnya}'")
    if cek_pendek is True and not hasil.get("diperpendek"):
        alasan.append("seharusnya terdeteksi link pendek")
    if cek_pendek is False and hasil.get("diperpendek"):
        alasan.append("tidak boleh dianggap link pendek")
    return (not alasan), alasan


async def _tanpa_screenshot(url):
    return None


def uji_satu(baris):
    no, link, kelompok, kunci, kode_kunci, seharusnya, cek_pendek = baris
    catatan = []
    try:
        hasil = asyncio.run(link_info.deskripsikan_link(link))
    except Exception as e:
        hasil = {"dapat_dijangkau": False, "kode_jenis": "tidak_diketahui", "jenis_situs": None,
                 "diperpendek": False, "catatan": [], "server": None}
        catatan.append(f"Error saat cek: {type(e).__name__}: {e}")

    ok, alasan = sesuai_harapan(hasil, seharusnya, cek_pendek)
    catatan += alasan
    if hasil.get("diperpendek"):
        catatan.append(f"Link pendek, dibuka ke {hasil.get('domain')}")
    perantara = (hasil.get("server") or {}).get("perantara")
    if perantara:
        catatan.append(f"Memakai {perantara}: lokasi asli tersembunyi, negara tidak dibandingkan")

    # tanggal domain: sistem (RDAP) vs WHOIS
    tgl_sistem = (hasil.get("domain_info") or {}).get("tanggal_daftar")
    tgl_whois, tgl_cocok = None, None
    if hasil.get("dapat_dijangkau") and hasil.get("domain"):
        try:
            tgl_whois = tanggal_whois(hasil["domain"])
            if tgl_whois is None:
                catatan.append("WHOIS tidak memuat tanggal pendaftaran")
        except Exception as e:
            catatan.append(f"WHOIS gagal ({type(e).__name__})")
        if tgl_sistem and tgl_whois:
            selisih = abs((date.fromisoformat(tgl_sistem) - tgl_whois).days)
            tgl_cocok = selisih <= 1
            if selisih == 1:
                catatan.append("Tanggal selisih 1 hari (beda zona waktu)")

    # negara server: sistem (DB-IP) vs ipinfo.io
    server = hasil.get("server") or {}
    neg_sistem, kode_sistem = server.get("negara"), server.get("kode_negara")
    neg_ipinfo, neg_cocok = None, None
    if server.get("ip") and not perantara:
        try:
            neg_ipinfo = negara_ipinfo(server["ip"])
        except Exception as e:
            catatan.append(f"ipinfo.io gagal ({type(e).__name__})")
        if kode_sistem and neg_ipinfo:
            neg_cocok = kode_sistem.upper() == neg_ipinfo.upper()

    tampil = hasil.get("jenis_situs") or hasil.get("jenis_singkat") or "-"
    return {
        "No": no, "Link": link, "Kelompok": kelompok, "Jenis sebenarnya (kunci)": kunci,
        "Seharusnya tampil di Jenis Situs": seharusnya or "Tidak Diketahui (domain tidak ditemukan)",
        "Tampil di sistem": tampil,
        "Dikenali dari": hasil.get("sumber_jenis") or "",
        "Penilaian": nilai_jenis(hasil, kode_kunci),
        "Sesuai harapan?": "Ya" if ok else "Tidak",
        "Tanggal terdaftar di sistem": tgl_sistem or "",
        "Tanggal di WHOIS": tgl_whois.isoformat() if tgl_whois else "",
        "Tanggal cocok?": "" if tgl_cocok is None else ("Ya" if tgl_cocok else "Tidak"),
        "Negara server di sistem": (f"Tersembunyi ({perantara})" if perantara
                                    else f"{neg_sistem} ({kode_sistem})" if neg_sistem else ""),
        "Negara di ipinfo.io": neg_ipinfo or "",
        "Negara cocok?": "" if neg_cocok is None else ("Ya" if neg_cocok else "Tidak"),
        "Catatan": "; ".join(catatan),
    }


def persen(a, b):
    return f"{a / b * 100:.1f}% ({a}/{b})" if b else "-"


def main():
    link_info._screenshot = _tanpa_screenshot          # screenshot tidak ikut diuji
    if not link_info.data_ip_tersedia():
        print("PERINGATAN: database lokasi IP belum ada. Jalankan dulu: python -m services.threat.data_ip")

    daftar = LINK_UJI + LINK_TAMBAHAN
    semua = []
    mulai = time.time()
    for i, baris in enumerate(daftar, 1):
        print(f"[{i:2}/{len(daftar)}] {baris[1]} ...", end=" ", flush=True)
        h = uji_satu(baris)
        semua.append(h)
        print(f"{h['Penilaian']:<14} | sesuai harapan: {h['Sesuai harapan?']:<5} | {h['Tampil di sistem']}")

    nama_file = "hasil_uji_verifikasi.csv"
    with open(nama_file, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=list(semua[0].keys()), delimiter=";")
        w.writeheader()
        w.writerows(semua)

    n = len(semua)
    benar = sum(h["Penilaian"] == "Benar" for h in semua)
    salah = sum(h["Penilaian"] == "Salah" for h in semua)
    sesuai = sum(h["Sesuai harapan?"] == "Ya" for h in semua)
    tgl = [h for h in semua if h["Tanggal cocok?"]]
    neg = [h for h in semua if h["Negara cocok?"]]

    print("\n================ RINGKASAN ================")
    print(f"Tanggal uji            : {datetime.now():%d-%m-%Y %H:%M} (durasi {time.time() - mulai:.0f} detik)")
    print(f"Link diuji             : {n}")
    print(f"Akurasi jenis situs    : {persen(benar, benar + salah)}")
    print(f"Cakupan jenis situs    : {persen(benar + salah, n)}")
    print(f"Sesuai harapan         : {persen(sesuai, n)}")
    print(f"Tanggal cocok (WHOIS)  : {persen(sum(h['Tanggal cocok?'] == 'Ya' for h in tgl), len(tgl))}")
    print(f"Negara cocok (ipinfo)  : {persen(sum(h['Negara cocok?'] == 'Ya' for h in neg), len(neg))}"
          f"  (situs di belakang Cloudflare dkk. tidak dihitung: "
          f"{sum(h['Negara server di sistem'].startswith('Tersembunyi') for h in semua)} link)")
    print(f"\nPenilaian 'Salah' : {[h['No'] for h in semua if h['Penilaian'] == 'Salah'] or 'tidak ada'}")
    print(f"Tidak sesuai harapan: {[h['No'] for h in semua if h['Sesuai harapan?'] == 'Tidak'] or 'tidak ada'}")
    print(f"\nTabel lengkap disimpan di: {nama_file}")


if __name__ == "__main__":
    sys.exit(main())
