"""
Deskripsi link (fitur Verifikasi versi sederhana).

Menjawab 4 pertanyaan tentang sebuah link, TANPA skor dan TANPA label aman/berbahaya:
  1. Situs apa ini?            -> jenis situs (mis. judi online), dari isi halaman
  2. Servernya di negara mana? -> IP server -> negara (ipwho.is, gratis, tanpa kunci)
  3. Kapan domain terdaftar?   -> RDAP (gratis, tanpa kunci); cadangan: WHOIS XML API
  4. Seperti apa tampilannya?  -> screenshot (Microlink, sudah ada)

Hasilnya satu kamus (dict) yang dikirim apa adanya oleh endpoint /verify-link.
Setiap sumber data bersifat opsional: kalau gagal, bagiannya diisi "tidak diketahui"
dan sisanya tetap ditampilkan.
"""

import asyncio
import ipaddress
import os
import re
import socket
import time
from datetime import datetime, timezone
from html import unescape
from urllib.parse import urlparse

import requests
import tldextract
from dateutil import parser as date_parser

from . import content_analyzer, microlink, url_resolver

# ---------------------------------------------------------------- pengaturan
TIMEOUT = 8                    # detik, untuk tiap permintaan ke luar
BATAS_HTML = 600_000           # baca paling banyak ~600 KB halaman
CACHE_DETIK = 3600             # simpan hasil 1 jam (hemat kuota API gratis)
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept-Language": "id-ID,id;q=0.9,en;q=0.8"}

_CACHE: dict = {}
# suffix_list_urls=() -> pakai daftar bawaan paket, tidak mengunduh apa pun
_EKSTRAK = tldextract.TLDExtract(suffix_list_urls=())

BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli",
         "Agustus", "September", "Oktober", "November", "Desember"]

# kategori dari content_analyzer -> (kode, nama untuk pengguna, perlu waspada?)
KATEGORI = {
    "Gambling": ("judi_online", "Situs judi online", "Judi Online", True),
    "Piracy / Warez": ("pembajakan", "Situs pembajakan / unduhan bajakan", "Pembajakan", True),
    "Adult / Pornography": ("dewasa", "Situs konten dewasa", "Konten Dewasa", True),
    "Malware Distribution": ("malware", "Situs penyebar program berbahaya (malware)", "Penyebar Malware", True),
    "Scam / Phishing": ("penipuan", "Situs penipuan / phishing", "Penipuan / Phishing", True),
    "Illegal Marketplace": ("pasar_ilegal", "Pasar jual-beli ilegal", "Pasar Ilegal", True),
    "Official/Legal": ("resmi", "Platform / situs resmi yang populer", "Situs Resmi", False),
}


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


def _cari_ip(host: str):
    try:
        return socket.gethostbyname(host)
    except Exception:
        return None


# ---------------------------------------------------------------- 1. lokasi server
def lokasi_server(ip: str) -> dict:
    """IP -> negara, kota, penyedia hosting (ipwho.is, HTTPS, tanpa kunci)."""
    kosong = {"ip": ip, "negara": None, "kode_negara": None, "kota": None, "penyedia": None}
    try:
        r = requests.get(f"https://ipwho.is/{ip}", timeout=TIMEOUT)
        d = r.json()
        if not d.get("success"):
            return kosong
        koneksi = d.get("connection") or {}
        return {"ip": ip, "negara": d.get("country"), "kode_negara": d.get("country_code"),
                "kota": d.get("city"), "penyedia": koneksi.get("org") or koneksi.get("isp")}
    except Exception:
        return kosong


# ---------------------------------------------------------------- 2. tanggal domain
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


def _whoisxml(domain: str) -> dict | None:
    kunci = (os.getenv("WHOISXML_API_KEY") or "").strip()
    if not kunci:
        return None
    r = requests.get("https://www.whoisxmlapi.com/whoisserver/WhoisService", timeout=TIMEOUT,
                     params={"apiKey": kunci, "domainName": domain,
                             "outputFormat": "JSON", "ignoreRawTexts": "1"})
    if r.status_code != 200:
        return None
    rec = r.json().get("WhoisRecord", {})
    tgl = rec.get("createdDate") or (rec.get("registryData") or {}).get("createdDate")
    ubah = rec.get("updatedDate") or (rec.get("registryData") or {}).get("updatedDate")
    return ({"tanggal": tgl, "registrar": rec.get("registrarName"), "diperbarui": ubah}
            if tgl else None)


def _ke_tanggal(teks):
    dt = date_parser.parse(teks)
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


def info_domain(domain: str) -> dict:
    """Tanggal pendaftaran domain + registrar. RDAP dulu, WHOIS XML sebagai cadangan."""
    kosong = {"tanggal_daftar": None, "tanggal_daftar_teks": None, "usia_teks": None,
              "usia_hari": None, "diperbarui_teks": None, "registrar": None}
    for sumber in (_rdap, _whoisxml):
        try:
            data = sumber(domain)
            if not data:
                continue
            dt = _ke_tanggal(data["tanggal"])
            try:
                diperbarui = _tanggal_indo(_ke_tanggal(data["diperbarui"])) if data.get("diperbarui") else None
            except Exception:
                diperbarui = None
            registrar = (data.get("registrar") or "").strip() or None
            return {"tanggal_daftar": dt.date().isoformat(),
                    "tanggal_daftar_teks": _tanggal_indo(dt),
                    "usia_teks": _usia_teks(dt),
                    "usia_hari": max((datetime.now(timezone.utc) - dt).days, 0),
                    "diperbarui_teks": diperbarui,
                    "registrar": registrar}
        except Exception:
            continue
    return kosong


# ---------------------------------------------------------------- 3. jenis situs
def _ambil_meta(html: str, nama: str):
    for pola in (rf'<meta[^>]+(?:name|property)=["\']{nama}["\'][^>]*content=["\']([^"\']*)["\']',
                 rf'<meta[^>]+content=["\']([^"\']*)["\'][^>]*(?:name|property)=["\']{nama}["\']'):
        m = re.search(pola, html, re.IGNORECASE)
        if m:
            return unescape(m.group(1)).strip()
    return None


def baca_halaman(url: str) -> dict:
    """Ambil judul + deskripsi halaman. 'terbaca' = False bila halaman tidak bisa dibuka."""
    hasil = {"terbaca": False, "judul": None, "deskripsi": None}
    try:
        r = requests.get(url, headers=UA, timeout=TIMEOUT, allow_redirects=True)
        if r.status_code != 200:
            return hasil
        html = r.text[:BATAS_HTML]
        m = re.search(r"<title[^>]*>(.*?)</title>", html, re.IGNORECASE | re.DOTALL)
        judul = unescape(re.sub(r"\s+", " ", m.group(1))).strip() if m else None
        desk = _ambil_meta(html, "description") or _ambil_meta(html, "og:description")
        hasil.update(terbaca=True, judul=(judul or None),
                     deskripsi=(desk[:200] if desk else None))
    except Exception:
        pass
    return hasil


def tentukan_jenis(url: str, halaman: dict) -> dict:
    """Jenis situs dari content_analyzer yang sudah ada (pola kata khas isi halaman)."""
    if not halaman["terbaca"] and not content_analyzer.is_official_domain(url):
        return {"kode": "tidak_diketahui", "nama": "Tidak diketahui (isi situs tidak bisa dibaca)",
                "singkat": "Tidak Diketahui", "perlu_waspada": False, "keyakinan": "-", "ciri": []}
    a = content_analyzer.analyze_content(url)
    kode, nama, singkat, waspada = KATEGORI.get(
        a.get("category"),
        ("umum", "Situs umum (tidak ada ciri jenis khusus yang terbaca)", "Situs Umum", False))
    keyakinan = {"high": "tinggi", "medium": "sedang"}.get(a.get("confidence"), "rendah")
    ciri = a.get("reasons", [])[:5] if kode not in ("umum", "resmi") else []
    return {"kode": kode, "nama": nama, "singkat": singkat, "perlu_waspada": waspada,
            "keyakinan": keyakinan if kode not in ("umum", "resmi") else "-", "ciri": ciri}


# ---------------------------------------------------------------- 4. kalimat deskripsi
def susun_deskripsi(domain: str, jenis: dict, server: dict, dom: dict) -> str:
    if jenis["kode"] == "tidak_diketahui":
        kalimat = [f"Jenis situs {domain} belum dapat ditentukan."]
    else:
        kalimat = [f"{domain} adalah {jenis['nama'][0].lower() + jenis['nama'][1:]}."]
    if server.get("negara"):
        tempat = server["negara"] + (f" (kota {server['kota']})" if server.get("kota") else "")
        oleh = f", dikelola {server['penyedia']}" if server.get("penyedia") else ""
        kalimat.append(f"Servernya berada di {tempat}{oleh}.")
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
            "dapat_dijangkau": False, "jenis_situs": None, "jenis_singkat": "Tidak Diketahui",
            "kode_jenis": "tidak_diketahui",
            "keyakinan_jenis": "-", "perlu_waspada": False, "ciri": [],
            "judul_halaman": None, "deskripsi_halaman": None,
            "server": None, "domain_info": None, "screenshot": None,
            "deskripsi": pesan, "catatan": []}


def _bangun(url_awal: str) -> dict:
    """Bagian yang berjalan berurutan (bukan jaringan lambat): perluas shortener, cek DNS."""
    url = url_awal.strip()
    if not re.match(r"^https?://", url, re.IGNORECASE):
        url = "https://" + url
    diperpendek = False
    ex = url_resolver.expand_url(url)
    if ex.get("is_shortened") and ex.get("expanded_url"):
        diperpendek, url = True, ex["expanded_url"]
    host = (urlparse(url).hostname or "").lower()
    return {"url": url, "diperpendek": diperpendek, "host": host}


async def _screenshot(url: str):
    try:
        return await asyncio.wait_for(asyncio.to_thread(microlink.capture_screenshot, url), 22)
    except Exception:
        return None


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
        return _cuplikan_tidak_terjangkau(
            url, host, f"Domain {host} tidak ditemukan di internet. Periksa kembali ejaan link.")
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
    jenis = await asyncio.to_thread(tentukan_jenis, url, halaman)

    catatan = []
    if "cloudflare" in (server.get("penyedia") or "").lower():
        catatan.append("Situs memakai Cloudflare, jadi lokasi server di atas adalah lokasi "
                       "jaringan Cloudflare, bukan tentu lokasi server aslinya.")
    if not halaman["terbaca"]:
        catatan.append("Isi halaman tidak bisa dibaca, jadi jenis situs tidak dapat ditentukan.")
    catatan.append("Ini hanya gambaran informasi link, bukan jaminan link aman.")

    hasil = {
        "url": url, "url_awal": url_awal.strip(), "diperpendek": dasar["diperpendek"],
        "domain": domain, "dapat_dijangkau": True,
        "jenis_situs": jenis["nama"], "jenis_singkat": jenis["singkat"], "kode_jenis": jenis["kode"],
        "keyakinan_jenis": jenis["keyakinan"], "perlu_waspada": jenis["perlu_waspada"],
        "ciri": jenis["ciri"],
        "judul_halaman": halaman["judul"], "deskripsi_halaman": halaman["deskripsi"],
        "server": server, "domain_info": dom, "screenshot": foto,
        "deskripsi": susun_deskripsi(domain, jenis, server, dom), "catatan": catatan,
    }
    _CACHE[kunci] = (time.time(), hasil)
    return hasil