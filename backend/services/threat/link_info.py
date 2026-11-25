"""
Deskripsi link (fitur Verifikasi).

Menjawab beberapa pertanyaan FAKTA tentang sebuah link. Tidak ada skor, dan tidak ada
penilaian seperti aman/berbahaya/waspada:
  1. Situs apa ini?            -> daftar situs populer, isi halaman, akhiran domain, lalu
                                  keterangan yang ditulis situs itu sendiri (schema.org, judul)
  2. Apa saja ciri halamannya? -> fakta dari HTML (kolom kata sandi, kata OTP/PIN,
                                  tautan unduhan aplikasi, formulir yang dikirim ke domain lain)
  3. Servernya di negara mana? -> database DB-IP Lite yang disimpan di server (tanpa API).
                                  Untuk situs di belakang Cloudflare dkk., lokasi asli disebut tersembunyi.
  4. Kapan domain terdaftar?   -> RDAP (satu-satunya layanan data luar, gratis, tanpa kunci)
  5. Seperti apa tampilannya?  -> screenshot (Microlink)

Hasilnya satu kamus (dict) yang dikirim apa adanya oleh endpoint /verify-link.
Setiap sumber data bersifat opsional: kalau gagal, bagiannya diisi "tidak diketahui"
dan sisanya tetap ditampilkan.
"""

import asyncio
import ipaddress
import json
import re
import socket
import time
from datetime import datetime, timezone
from html import unescape
from urllib.parse import urljoin, urlparse

import requests
import tldextract
from dateutil import parser as date_parser

from . import content_analyzer, data_ip, microlink, url_resolver

# ---------------------------------------------------------------- pengaturan
TIMEOUT = 8                    # detik, untuk tiap permintaan ke luar
BATAS_HTML = 600_000           # baca paling banyak ~600 KB halaman
MAKS_PENGALIHAN = 5            # paling banyak 5 kali pengalihan (redirect)
CACHE_DETIK = 3600             # simpan hasil 1 jam
CACHE_MAKS = 500               # paling banyak 500 link disimpan, supaya memori tidak terus bertambah
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept-Language": "id-ID,id;q=0.9,en;q=0.8"}

_CACHE: dict = {}
_PEMBACA_IP: dict = {}
# suffix_list_urls=() -> pakai daftar bawaan paket, tidak mengunduh apa pun
_EKSTRAK = tldextract.TLDExtract(suffix_list_urls=())

BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli",
         "Agustus", "September", "Oktober", "November", "Desember"]

# Kategori isi halaman dari content_analyzer yang dipakai sebagai JENIS situs.
# Hanya jenis konten yang bisa dikenali dari isinya. Kategori lama yang berupa penilaian
# (penipuan, malware, pasar ilegal) tidak dipakai lagi; sebagai gantinya ada "ciri halaman".
KATEGORI_KONTEN = {
    "Gambling": ("judi_online", "Situs judi online", "Judi Online"),
    "Adult / Pornography": ("dewasa", "Situs konten dewasa", "Konten Dewasa"),
    "Piracy / Warez": ("unduhan_bajakan", "Situs unduhan film, game, atau aplikasi bajakan",
                       "Unduhan Bajakan"),
}

# Alasan dari content_analyzer yang berbunyi penilaian diganti kalimat fakta
# (content_analyzer juga dipakai chatbot, jadi teksnya tidak diubah di sana).
GANTI_CIRI_KONTEN = {
    "Tools ilegal": "Menyebut crack, keygen, repack, activator, atau patcher",
}

# Kategori umum yang dikenali dari keterangan yang ditulis SITUS ITU SENDIRI.
# kode: (nama untuk kalimat, nama pendek untuk lencana)
# Sengaja TIDAK ada kategori pemerintah, bank, atau keuangan: keterangan ini bisa dipalsukan,
# dan kategori itulah yang paling sering ditiru penipu. Kategori itu hanya dikenali dari
# daftar situs resmi dan akhiran domain (.go.id, .ac.id), yang tidak bisa dipalsukan.
KATEGORI_UMUM = {
    "berita": ("Situs berita", "Situs Berita"),
    "pendidikan_kursus": ("Situs pendidikan atau kursus online", "Pendidikan / Kursus"),
    "toko_online": ("Toko online", "Toko Online"),
    "kesehatan": ("Layanan kesehatan", "Kesehatan"),
    "ekspedisi": ("Layanan pengiriman barang", "Ekspedisi"),
    "transportasi": ("Layanan transportasi atau tiket perjalanan", "Transportasi"),
    "forum": ("Forum atau komunitas online", "Forum"),
    "blog": ("Blog", "Blog"),
}

# Tipe schema.org (https://schema.org) -> kategori. Urutan = prioritas bila ada beberapa tipe.
SCHEMA_KATEGORI = [
    ("berita", {"NewsMediaOrganization", "NewsArticle", "ReportageNewsArticle",
                "AnalysisNewsArticle", "OpinionNewsArticle", "BackgroundNewsArticle"}),
    ("pendidikan_kursus", {"EducationalOrganization", "CollegeOrUniversity", "School",
                           "HighSchool", "MiddleSchool", "ElementarySchool", "Course",
                           "CourseInstance", "EducationalOccupationalProgram"}),
    ("kesehatan", {"MedicalOrganization", "Hospital", "MedicalClinic", "Physician",
                   "Pharmacy", "Dentist", "DiagnosticLab", "MedicalWebPage"}),
    ("transportasi", {"TrainTrip", "BusTrip", "Flight", "Airline", "TravelAgency",
                      "TrainStation", "BusStation", "Airport"}),
    ("ekspedisi", {"ParcelDelivery"}),
    ("toko_online", {"OnlineStore", "Store", "Product"}),
    ("forum", {"DiscussionForumPosting"}),
    ("blog", {"Blog", "BlogPosting"}),
]

# Kata kunci di judul + deskripsi halaman, dipakai bila tidak ada keterangan schema.org.
KATA_KATEGORI = [
    ("berita", r"\b(?:berita|news|kabar terkini|portal berita|breaking news)\b"),
    ("pendidikan_kursus", r"\b(?:kursus|bootcamp|bimbel|bimbingan belajar|pelatihan|e-?learning|"
                          r"kelas online|belajar online|online course|sertifikasi)\b"),
    ("kesehatan", r"\b(?:dokter|klinik|rumah sakit|apotek online|telemedicine|"
                  r"konsultasi kesehatan|layanan kesehatan)\b"),
    ("ekspedisi", r"\b(?:ekspedisi|kirim paket|pengiriman paket|jasa pengiriman|cek resi|"
                  r"lacak paket|kurir)\b"),
    ("transportasi", r"\b(?:tiket kereta|kereta api|tiket pesawat|tiket bus|transportasi)\b"),
    ("toko_online", r"\b(?:belanja online|toko online|marketplace|jual beli online|"
                    r"online shop|online store)\b"),
    ("forum", r"\b(?:forum|komunitas online|online community)\b"),
    ("blog", r"\bblog\b"),
]

# Penyedia yang berdiri DI DEPAN server asli (reverse proxy / CDN). Untuk situs seperti ini,
# IP yang terlihat milik penyedia tersebut, jadi lokasi server aslinya tidak bisa diketahui.
PENYEDIA_PERANTARA = {"cloudflare": "Cloudflare", "akamai": "Akamai", "fastly": "Fastly",
                      "incapsula": "Imperva", "imperva": "Imperva", "sucuri": "Sucuri"}

# jenis domain dari akhirannya (diperiksa dari yang paling panjang)
AKHIRAN_DOMAIN = [
    ("go.id", "pemerintah", "Domain pemerintah Indonesia (.go.id)"),
    ("desa.id", "pemerintah", "Domain pemerintah desa (.desa.id)"),
    ("mil.id", "pemerintah", "Domain militer Indonesia (.mil.id)"),
    ("ac.id", "pendidikan", "Domain perguruan tinggi Indonesia (.ac.id)"),
    ("sch.id", "pendidikan", "Domain sekolah Indonesia (.sch.id)"),
    ("or.id", "organisasi", "Domain organisasi Indonesia (.or.id)"),
    ("co.id", "komersial", "Domain perusahaan Indonesia (.co.id)"),
    ("web.id", "umum", "Domain umum Indonesia (.web.id)"),
    ("my.id", "umum", "Domain pribadi Indonesia (.my.id)"),
    ("biz.id", "komersial", "Domain usaha Indonesia (.biz.id)"),
    ("gov", "pemerintah", "Domain pemerintah (.gov)"),
    ("edu", "pendidikan", "Domain pendidikan (.edu)"),
    ("org", "organisasi", "Domain organisasi (.org)"),
    ("com", "komersial", "Domain komersial (.com)"),
    ("net", "umum", "Domain umum (.net)"),
    ("id", "umum", "Domain umum Indonesia (.id)"),
]

# situs besar yang sudah dikenal luas (melengkapi daftar di content_analyzer)
SITUS_POPULER = {
    "google.com", "google.co.id", "gmail.com", "wikipedia.org", "microsoft.com", "apple.com",
    "github.com", "zoom.us", "canva.com", "openai.com", "bing.com", "yahoo.com",
    "detik.com", "kompas.com", "tempo.co", "cnnindonesia.com", "liputan6.com",
    "gojek.com", "grab.com", "traveloka.com", "tiket.com",
    "bca.co.id", "bri.co.id", "bni.co.id", "bankmandiri.co.id",
}

# kategori situs populer, agar jenisnya lebih jelas (mis. toko online, bank)
KATEGORI_POPULER = {
    "Toko online (e-commerce)": ["shopee.co.id", "tokopedia.com", "bukalapak.com", "blibli.com",
                                 "lazada.co.id", "amazon.com", "ebay.com", "alibaba.com"],
    "Media sosial": ["facebook.com", "instagram.com", "twitter.com", "x.com", "tiktok.com",
                     "linkedin.com"],
    "Aplikasi pesan": ["whatsapp.com", "telegram.org"],
    "Layanan streaming": ["netflix.com", "spotify.com", "disneyplus.com", "hbo.com",
                          "primevideo.com", "youtube.com", "twitch.tv"],
    "Platform game": ["steampowered.com", "steamcommunity.com", "epicgames.com", "garena.co.id",
                      "garena.com", "origin.com", "ea.com", "ubisoft.com", "blizzard.com",
                      "battle.net", "playstation.com", "xbox.com", "nintendo.com",
                      "riotgames.com", "leagueoflegends.com", "valorant.net", "minecraft.net",
                      "roblox.com", "fortnite.com"],
    "Layanan pembayaran": ["paypal.com", "stripe.com", "midtrans.com", "xendit.co"],
    "Bank": ["bca.co.id", "bri.co.id", "bni.co.id", "bankmandiri.co.id"],
    "Situs berita": ["detik.com", "kompas.com", "tempo.co", "cnnindonesia.com", "liputan6.com"],
    "Layanan transportasi dan perjalanan": ["gojek.com", "grab.com", "traveloka.com", "tiket.com"],
    "Layanan internet": ["google.com", "google.co.id", "gmail.com", "bing.com", "yahoo.com",
                         "microsoft.com", "apple.com", "wikipedia.org", "github.com", "zoom.us",
                         "canva.com", "openai.com"],
}


def kategori_populer(domain: str):
    """Cari kategori situs populer, mis. 'shopee.co.id' -> 'Toko online (e-commerce)'."""
    for kategori, daftar in KATEGORI_POPULER.items():
        if domain in daftar:
            return kategori
    return None


# ---------------------------------------------------------------- alat kecil
def _tanggal_indo(dt: datetime) -> str:
    return f"{dt.day} {BULAN[dt.month - 1]} {dt.year}"


def _usia_teks(dt: datetime) -> str:
    hari = max((datetime.now(timezone.utc) - dt).days, 0)
    tahun, sisa = divmod(hari, 365)
    bulan = sisa // 30
    if tahun:
        return f"{tahun} tahun" + (f" {bulan} bulan" if bulan else "")
    if bulan:
        return f"{bulan} bulan"
    return f"{hari} hari"


def _ip_publik(ip: str) -> bool:
    try:
        a = ipaddress.ip_address(ip)
    except ValueError:
        return False
    return not (a.is_private or a.is_loopback or a.is_link_local
                or a.is_reserved or a.is_multicast or a.is_unspecified)


def _domain_utama(host: str) -> str:
    e = _EKSTRAK(host)
    return f"{e.domain}.{e.suffix}" if e.domain and e.suffix else host


def jenis_domain(domain: str) -> dict:
    """Jenis domain dari akhirannya, mis. .go.id = pemerintah. Tanpa API."""
    akhiran = _EKSTRAK(domain).suffix.lower()
    for ujung, kode, nama in AKHIRAN_DOMAIN:
        if akhiran == ujung or akhiran.endswith("." + ujung):
            return {"kode": kode, "nama": nama}
    return {"kode": "lain", "nama": f"Domain umum (.{akhiran})" if akhiran else "Tidak diketahui"}


def _cari_ip(host: str):
    try:
        return socket.gethostbyname(host)
    except Exception:
        return None


def _alamat_publik(url: str) -> bool:
    """True bila host pada url mengarah ke alamat internet publik (bukan jaringan internal)."""
    host = (urlparse(url).hostname or "").lower()
    if not host or urlparse(url).scheme not in ("http", "https"):
        return False
    ip = host if re.fullmatch(r"\d{1,3}(\.\d{1,3}){3}", host) else _cari_ip(host)
    return bool(ip) and _ip_publik(ip)


# ---------------------------------------------------------------- 1. lokasi server (lokal)
def _pembaca_ip(jenis: str):
    """Buka file .mmdb (database DB-IP) dan pakai ulang.

    Dibuka ulang otomatis bila filenya diperbarui (waktu ubahnya berbeda),
    jadi server tidak perlu dinyalakan ulang setelah data_ip.perbarui().
    None bila file belum ada.
    """
    path = data_ip.path_berkas(jenis)
    try:
        waktu = path.stat().st_mtime
    except OSError:
        return None
    lama = _PEMBACA_IP.get(jenis)
    if lama and lama[0] == waktu:
        return lama[1]
    try:
        import maxminddb
        pembaca = maxminddb.open_database(str(path))
    except Exception:
        return None
    _PEMBACA_IP[jenis] = (waktu, pembaca)
    return pembaca


def data_ip_tersedia() -> bool:
    return _pembaca_ip("negara") is not None


def lokasi_server(ip: str) -> dict:
    """IP -> negara + penyedia jaringan, dibaca dari database DB-IP Lite di server (tanpa API)."""
    hasil = {"ip": ip, "negara": None, "kode_negara": None, "penyedia": None, "perantara": None}
    try:
        db = _pembaca_ip("negara")
        rec = db.get(ip) if db else None
        negara = (rec or {}).get("country") or {}
        hasil["negara"] = (negara.get("names") or {}).get("en")
        hasil["kode_negara"] = negara.get("iso_code")
    except Exception:
        pass
    try:
        db = _pembaca_ip("asn")
        rec = (db.get(ip) if db else None) or {}
        hasil["penyedia"] = next((rec[k] for k in data_ip.KOLOM_PENYEDIA if rec.get(k)), None)
    except Exception:
        pass
    penyedia = (hasil["penyedia"] or "").lower()
    hasil["perantara"] = next((nama for kata, nama in PENYEDIA_PERANTARA.items() if kata in penyedia), None)
    return hasil


# ---------------------------------------------------------------- 2. tanggal domain (RDAP)
def _rdap(domain: str) -> dict | None:
    r = requests.get(f"https://rdap.org/domain/{domain}", timeout=TIMEOUT,
                     headers={"Accept": "application/rdap+json"})
    if r.status_code != 200:
        return None
    d = r.json()
    tgl, ubah = None, None
    for ev in d.get("events", []):
        if ev.get("eventAction") == "registration":
            tgl = ev.get("eventDate")
        elif ev.get("eventAction") == "last changed":
            ubah = ev.get("eventDate")
    registrar = None
    for ent in d.get("entities", []):
        if "registrar" in (ent.get("roles") or []):
            for item in (ent.get("vcardArray") or [None, []])[1]:
                if item and item[0] == "fn":
                    registrar = item[3]
    return {"tanggal": tgl, "registrar": registrar, "diperbarui": ubah} if tgl else None


def _ke_tanggal(teks):
    dt = date_parser.parse(teks)
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


def info_domain(domain: str) -> dict:
    """Tanggal pendaftaran domain dan registrar, dari RDAP (gratis, tanpa kunci)."""
    hasil = {"tanggal_daftar": None, "tanggal_daftar_teks": None, "usia_teks": None,
             "usia_hari": None, "diperbarui_teks": None, "registrar": None}
    try:
        data = _rdap(domain)
        if not data:
            return hasil
        dt = _ke_tanggal(data["tanggal"])
    except Exception:
        return hasil
    try:
        diperbarui = _tanggal_indo(_ke_tanggal(data["diperbarui"])) if data.get("diperbarui") else None
    except Exception:
        diperbarui = None
    hasil.update(tanggal_daftar=dt.date().isoformat(),
                 tanggal_daftar_teks=_tanggal_indo(dt),
                 usia_teks=_usia_teks(dt),
                 usia_hari=max((datetime.now(timezone.utc) - dt).days, 0),
                 diperbarui_teks=diperbarui,
                 registrar=(data.get("registrar") or "").strip() or None)
    return hasil


# ---------------------------------------------------------------- 3. membaca halaman
def _ambil_meta(html: str, nama: str):
    for pola in (rf'<meta[^>]+(?:name|property)=["\']{nama}["\'][^>]*content=["\']([^"\']*)["\']',
                 rf'<meta[^>]+content=["\']([^"\']*)["\'][^>]*(?:name|property)=["\']{nama}["\']'):
        m = re.search(pola, html, re.IGNORECASE)
        if m:
            return unescape(m.group(1)).strip()
    return None


def _ikuti_pengalihan(url: str, metode: str = "GET"):
    """Ikuti pengalihan satu per satu (paling banyak MAKS_PENGALIHAN kali).

    Setiap alamat diperiksa dulu: kalau mengarah ke jaringan internal, berhenti.
    Mengembalikan (respons_terakhir, url_terakhir, semua_publik).
    """
    r = None
    for _ in range(MAKS_PENGALIHAN + 1):
        if not _alamat_publik(url):
            return None, url, False
        r = requests.request(metode, url, headers=UA, timeout=TIMEOUT, allow_redirects=False)
        tujuan = r.headers.get("Location") if r.status_code in (301, 302, 303, 307, 308) else None
        if not tujuan:
            break
        url = urljoin(url, tujuan)
    return r, url, True


def baca_halaman(url: str) -> dict:
    """Ambil judul, deskripsi, dan HTML halaman. 'terbaca' = False bila halaman tidak bisa dibuka.

    'url_akhir' = alamat halaman yang benar-benar dibaca (setelah pengalihan).
    '_html' hanya dipakai di dalam modul ini dan tidak ikut dikirim ke frontend.
    """
    hasil = {"terbaca": False, "judul": None, "deskripsi": None, "url_akhir": url,
             "internal": False, "_html": ""}
    try:
        r, url_akhir, publik = _ikuti_pengalihan(url)
        hasil["url_akhir"] = url_akhir
        if not publik:
            hasil["internal"] = True
            return hasil
        if r is None or r.status_code != 200:
            return hasil

        if "charset" not in r.headers.get("Content-Type", "").lower():
            r.encoding = "utf-8"
        html = r.text[:BATAS_HTML]

        m = re.search(r"<title[^>]*>(.*?)</title>", html, re.IGNORECASE | re.DOTALL)
        judul = unescape(re.sub(r"\s+", " ", m.group(1))).strip() if m else None
        desk = _ambil_meta(html, "description") or _ambil_meta(html, "og:description")
        hasil.update(terbaca=True, judul=(judul or None),
                     deskripsi=(desk[:200] if desk else None), _html=html)
    except Exception:
        pass
    return hasil


# ---------------------------------------------------------------- 4. ciri halaman (fakta)
# Kata yang dicari di teks halaman. "pin" saja terlalu umum (mis. "pin" di Pinterest),
# jadi PIN hanya dihitung bila muncul bersama kata seperti kode/nomor/masukkan/ATM.
POLA_DATA_RAHASIA = [
    (r"\b(?:kode\s+)?otp\b", "kode OTP"),
    (r"\b(?:kode|nomor|masukkan|input)\s+pin\b|\bpin\s+(?:atm|anda|kamu|m-?banking)\b", "PIN"),
    (r"\bcvv2?\b|\bcvc\b", "kode CVV/CVC kartu"),
]

def ciri_halaman(html: str, domain: str) -> list[str]:
    """Fakta yang terlihat di HTML. Hanya menyebut apa yang ada, tanpa menilai."""
    if not html:
        return []
    ciri = []
    if re.search(r"<input[^>]+type\s*=\s*[\"']?password", html, re.IGNORECASE):
        ciri.append("Halaman memuat kolom kata sandi (password).")

    # teks yang terlihat saja: buang <script>/<style> dulu, lalu semua tag
    teks = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", html, flags=re.IGNORECASE | re.DOTALL)
    teks = re.sub(r"<[^>]+>", " ", teks)
    disebut = [nama for pola, nama in POLA_DATA_RAHASIA if re.search(pola, teks, re.IGNORECASE)]
    if disebut:
        ciri.append(f"Halaman menyebut {', '.join(disebut)}.")

    ekstensi = sorted({e.lower() for e in re.findall(
        r"href\s*=\s*[\"'][^\"']+?\.(apk|exe|msi|scr|bat)(?:[?#][^\"']*)?[\"']", html, re.IGNORECASE)})
    if ekstensi:
        ciri.append("Halaman memuat tautan unduhan file " + ", ".join(f".{e}" for e in ekstensi) + ".")

    tujuan_form = set()
    for aksi in re.findall(r"<form[^>]+action\s*=\s*[\"'](https?://[^\"']+)[\"']", html, re.IGNORECASE):
        host = (urlparse(aksi).hostname or "").lower()
        if host and _domain_utama(host) != domain:
            tujuan_form.add(_domain_utama(host))
    if tujuan_form:
        ciri.append("Formulir di halaman mengirim data ke domain lain: "
                    + ", ".join(sorted(tujuan_form)) + ".")
    return ciri


# ---------------------------------------------------------------- 5. jenis situs
def _tipe_schema(html: str) -> set[str]:
    """Kumpulkan semua tipe schema.org di halaman (JSON-LD dan microdata)."""
    tipe: set[str] = set()

    def jelajah(x):
        if isinstance(x, dict):
            t = x.get("@type")
            for satu in (t if isinstance(t, list) else [t]):
                if isinstance(satu, str):
                    tipe.add(satu.rsplit("/", 1)[-1])
            for v in x.values():
                jelajah(v)
        elif isinstance(x, list):
            for v in x:
                jelajah(v)

    for isi in re.findall(r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
                          html, re.IGNORECASE | re.DOTALL):
        try:
            jelajah(json.loads(isi.strip(), strict=False))
        except ValueError:
            continue
    for t in re.findall(r'itemtype=["\']https?://schema\.org/(\w+)', html, re.IGNORECASE):
        tipe.add(t)
    return tipe


def kategori_dari_halaman(halaman: dict):
    """Kategori umum dari keterangan yang ditulis situs itu sendiri.

    1. Tipe schema.org di kode HTML (mis. NewsMediaOrganization -> berita).
    2. Kalau tidak ada: kata kunci di judul + deskripsi halaman.
    Mengembalikan (kode, sumber) atau None.
    """
    tipe = _tipe_schema(halaman.get("_html", ""))
    for kode, daftar in SCHEMA_KATEGORI:
        cocok = sorted(tipe & daftar)
        if cocok:
            return kode, f"keterangan schema.org di kode halaman ({', '.join(cocok[:2])})"
    teks = " ".join(x for x in (halaman.get("judul"), halaman.get("deskripsi")) if x).lower()
    for kode, pola in KATA_KATEGORI:
        m = re.search(pola, teks)
        if m:
            return kode, f'kata "{m.group(0)}" di judul atau deskripsi halaman'
    return None


def tentukan_jenis(url: str, halaman: dict, domain: str = "", jdomain: dict | None = None) -> dict:
    """Jenis situs. Urutan: situs populer -> isi halaman -> jenis domain.

    Situs populer diperiksa PERTAMA, supaya artikel berita/ensiklopedia yang membahas judi
    tidak membuat situsnya (mis. detik.com) tercatat sebagai situs judi.
    Situs .go.id dan .ac.id tetap dibaca isinya, karena halaman situs seperti ini
    kadang disisipi konten judi.
    """
    jdomain = jdomain or {"kode": "lain"}
    dasar = {"keyakinan": "-", "ciri_konten": [], "sumber": None}

    if domain in SITUS_POPULER or content_analyzer.is_official_domain(url):
        kategori = kategori_populer(domain)
        nama = f"{kategori} resmi" if kategori else "Platform / situs resmi yang populer"
        return {"kode": "resmi", "nama": nama, "singkat": "Situs Resmi",
                **dasar, "sumber": "daftar situs populer"}

    if halaman["terbaca"]:
        # HTML yang SUDAH diambil dianalisis langsung: tidak ada permintaan jaringan kedua
        a = content_analyzer.analyze_html(halaman.get("url_akhir") or url, halaman.get("_html", ""))
        if a.get("category") in KATEGORI_KONTEN:
            kode, nama, singkat = KATEGORI_KONTEN[a["category"]]
            keyakinan = {"high": "tinggi", "medium": "sedang"}.get(a.get("confidence"), "rendah")
            return {"kode": kode, "nama": nama, "singkat": singkat,
                    "keyakinan": keyakinan, "sumber": "ciri isi halaman",
                    "ciri_konten": [GANTI_CIRI_KONTEN.get(r, r) for r in a.get("reasons", [])[:5]]}

    if jdomain["kode"] == "pemerintah":
        return {"kode": "pemerintah", "nama": "Situs pemerintah", "singkat": "Situs Pemerintah",
                **dasar, "sumber": "akhiran nama domain"}
    if jdomain["kode"] == "pendidikan":
        return {"kode": "pendidikan", "nama": "Situs lembaga pendidikan",
                "singkat": "Situs Pendidikan", **dasar, "sumber": "akhiran nama domain"}
    if halaman["terbaca"]:
        temuan = kategori_dari_halaman(halaman)
        if temuan:
            kode, sumber = temuan
            nama, singkat = KATEGORI_UMUM[kode]
            return {"kode": kode, "nama": nama, "singkat": singkat, **dasar, "sumber": sumber}
    if not halaman["terbaca"]:
        return {"kode": "tidak_diketahui", "nama": "Tidak diketahui (isi situs tidak bisa dibaca)",
                "singkat": "Tidak Diketahui", **dasar}
    return {"kode": "umum", "nama": "Jenis situs belum dikenali (tidak ditemukan ciri khusus)",
            "singkat": "Belum Dikenali", **dasar}


# ---------------------------------------------------------------- 6. kalimat deskripsi
def susun_deskripsi(domain: str, jenis: dict, server: dict, dom: dict,
                    domain_akhir: str | None = None) -> str:
    if jenis["kode"] == "tidak_diketahui":
        kalimat = [f"Jenis situs {domain} belum dapat ditentukan."]
    elif jenis["kode"] == "umum":
        kalimat = [f"Jenis situs {domain} belum dikenali karena tidak ditemukan ciri khusus pada halamannya."]
    else:
        kalimat = [f"{domain} adalah {jenis['nama'][0].lower() + jenis['nama'][1:]}."]
    if domain_akhir and domain_akhir != domain:
        kalimat.append(f"Saat dibuka, link ini dialihkan ke {domain_akhir}.")
    if server.get("perantara"):
        kalimat.append(f"Lokasi server aslinya tidak terlihat karena situs ini memakai "
                       f"{server['perantara']}, sehingga alamat IP yang terlihat adalah milik "
                       f"{server['perantara']}.")
    elif server.get("negara"):
        oleh = f", jaringan milik {server['penyedia'].rstrip('.')}" if server.get("penyedia") else ""
        kalimat.append(f"Servernya berada di {server['negara']}{oleh}.")
    else:
        kalimat.append("Lokasi server tidak berhasil diketahui.")
    if dom.get("tanggal_daftar_teks"):
        via = f" melalui {dom['registrar']}" if dom.get("registrar") else ""
        akhir = f"Domain ini terdaftar sejak {dom['tanggal_daftar_teks']} ({dom['usia_teks']} yang lalu){via}"
        kalimat.append(akhir if akhir.endswith(".") else akhir + ".")   # hindari titik ganda ("Inc..")
    else:
        kalimat.append("Tanggal pendaftaran domain tidak berhasil diketahui.")
    return " ".join(kalimat)


# ---------------------------------------------------------------- fungsi utama
def _cuplikan_tidak_terjangkau(url, host, pesan):
    return {"url": url, "url_awal": url, "diperpendek": False, "domain": host,
            "domain_akhir": None, "dapat_dijangkau": False, "jenis_situs": None,
            "jenis_singkat": "Tidak Diketahui", "kode_jenis": "tidak_diketahui",
            "sumber_jenis": None, "jenis_domain": None, "keyakinan_jenis": "-", "ciri": [],
            "judul_halaman": None, "deskripsi_halaman": None,
            "server": None, "domain_info": None, "screenshot": None,
            "deskripsi": pesan, "catatan": []}


def _domain_tidak_aktif(url: str, host: str) -> dict:
    """Nama domain tidak mengarah ke server mana pun (DNS tidak menemukan alamat IP).

    Situsnya memang tidak bisa dibuka, tapi data pendaftaran (RDAP) dan akhiran nama domain
    tetap bisa dibaca, karena keduanya tidak bergantung pada situs itu sendiri.
    """
    domain = _domain_utama(host)
    jdomain = jenis_domain(domain)
    dom = info_domain(domain)
    if not dom.get("tanggal_daftar"):
        hasil = _cuplikan_tidak_terjangkau(
            url, host, f"Domain {host} tidak ditemukan di internet. Periksa kembali ejaan link.")
        hasil["jenis_domain"] = jdomain["nama"]
        return hasil

    if jdomain["kode"] in ("pemerintah", "pendidikan"):
        kode = jdomain["kode"]
        nama, singkat = {"pemerintah": ("Situs pemerintah", "Situs Pemerintah"),
                         "pendidikan": ("Situs lembaga pendidikan", "Situs Pendidikan")}[kode]
        jenis = (kode, f"{nama} (tidak bisa dibuka saat ini)", singkat, "akhiran nama domain")
    else:
        jenis = ("tidak_diketahui", "Tidak diketahui (situs tidak aktif)", "Tidak Aktif", None)

    via = f" melalui {dom['registrar'].rstrip('.')}" if dom.get("registrar") else ""
    kalimat = [f"Alamat {host} saat ini tidak mengarah ke server mana pun, jadi situsnya tidak bisa dibuka.",
               f"Domain {domain} terdaftar sejak {dom['tanggal_daftar_teks']} ({dom['usia_teks']} yang lalu){via}."]
    if jenis[0] != "tidak_diketahui":
        kalimat.append(f"Dari akhiran namanya, ini adalah {jdomain['nama'][0].lower() + jdomain['nama'][1:]}.")

    hasil = _cuplikan_tidak_terjangkau(url, host, " ".join(kalimat))
    hasil.update(domain=domain, kode_jenis=jenis[0], jenis_situs=jenis[1], jenis_singkat=jenis[2],
                 sumber_jenis=jenis[3], jenis_domain=jdomain["nama"], domain_info=dom,
                 catatan=["Situs tidak aktif: tanggal domain diambil dari data pendaftaran domain (RDAP), "
                          "bukan dari situsnya."])
    return hasil


def _bangun(url_awal: str) -> dict:
    """Rapikan URL dan buka link pendek (bit.ly, s.id, ...) dengan pemeriksaan tiap pengalihan."""
    url = url_awal.strip()
    if not re.match(r"^https?://", url, re.IGNORECASE):
        url = "https://" + url
    diperpendek = False
    if url_resolver.is_shortened_url(url):
        for metode in ("HEAD", "GET"):            # sebagian layanan menolak HEAD, coba GET
            try:
                _, tujuan, publik = _ikuti_pengalihan(url, metode=metode)
            except Exception:
                continue
            if publik and tujuan != url:
                diperpendek, url = True, tujuan
                break
    host = (urlparse(url).hostname or "").lower()
    return {"url": url, "diperpendek": diperpendek, "host": host}


async def _screenshot(url: str):
    try:
        return await asyncio.wait_for(asyncio.to_thread(microlink.capture_screenshot, url), 22)
    except Exception:
        return None


def _simpan_cache(kunci: str, hasil: dict):
    sekarang = time.time()
    for k in [k for k, (t, _) in _CACHE.items() if sekarang - t >= CACHE_DETIK]:
        _CACHE.pop(k, None)                       # buang yang sudah kedaluwarsa
    while len(_CACHE) >= CACHE_MAKS:
        _CACHE.pop(next(iter(_CACHE)))            # buang yang paling lama disimpan
    _CACHE[kunci] = (sekarang, hasil)


async def deskripsikan_link(url_awal: str) -> dict:
    kunci = url_awal.strip().lower()
    ada = _CACHE.get(kunci)
    if ada and time.time() - ada[0] < CACHE_DETIK:
        return ada[1]

    dasar = await asyncio.to_thread(_bangun, url_awal)
    url, host = dasar["url"], dasar["host"]

    if not host or "." not in host:
        return _cuplikan_tidak_terjangkau(url, host, "Alamat yang dimasukkan bukan link yang valid.")
    if re.fullmatch(r"\d{1,3}(\.\d{1,3}){3}", host):
        ip = host                                    # link langsung berupa alamat IP
    else:
        ip = await asyncio.to_thread(_cari_ip, host)
    if not ip:
        return await asyncio.to_thread(_domain_tidak_aktif, url, host)
    if not _ip_publik(ip):
        return _cuplikan_tidak_terjangkau(
            url, host, "Link ini menunjuk ke alamat internal/lokal, sehingga tidak dianalisis.")

    domain = _domain_utama(host)
    server, dom, halaman, foto = await asyncio.gather(
        asyncio.to_thread(lokasi_server, ip),
        asyncio.to_thread(info_domain, domain),
        asyncio.to_thread(baca_halaman, url),
        _screenshot(url),
    )
    jdomain = jenis_domain(domain)
    jenis = await asyncio.to_thread(tentukan_jenis, url, halaman, domain, jdomain)
    ciri = jenis["ciri_konten"] + ciri_halaman(halaman.get("_html", ""), domain)

    host_akhir = (urlparse(halaman.get("url_akhir") or url).hostname or "").lower()
    domain_akhir = _domain_utama(host_akhir) if host_akhir else None

    catatan = []
    if server.get("perantara"):
        catatan.append(f"Situs memakai {server['perantara']}. Alamat IP yang terlihat milik "
                       f"{server['perantara']}, jadi lokasi server aslinya tidak bisa diketahui.")
    if halaman.get("internal"):
        catatan.append("Link ini dialihkan ke alamat internal, sehingga isi halamannya tidak dibaca.")
    elif not halaman["terbaca"]:
        catatan.append("Isi halaman tidak bisa dibaca, jadi jenis situs hanya dilihat dari nama domainnya.")
    if not data_ip_tersedia():
        catatan.append("Database lokasi IP belum tersedia di server, jadi lokasi server tidak ditampilkan.")
    catatan.append("Deskripsi ini disusun dari data publik dan isi halaman pada saat pengecekan.")

    hasil = {
        "url": url, "url_awal": url_awal.strip(), "diperpendek": dasar["diperpendek"],
        "domain": domain, "domain_akhir": domain_akhir, "dapat_dijangkau": True,
        "jenis_situs": jenis["nama"], "jenis_singkat": jenis["singkat"], "kode_jenis": jenis["kode"],
        "sumber_jenis": jenis.get("sumber"),
        "keyakinan_jenis": jenis["keyakinan"], "ciri": ciri, "jenis_domain": jdomain["nama"],
        "judul_halaman": halaman["judul"], "deskripsi_halaman": halaman["deskripsi"],
        "server": server, "domain_info": dom, "screenshot": foto,
        "deskripsi": susun_deskripsi(domain, jenis, server, dom, domain_akhir),
        "catatan": catatan,
    }
    _simpan_cache(kunci, hasil)
    return hasil
