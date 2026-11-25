"""
Database lokasi IP untuk fitur Verifikasi (pengganti API ipwho.is).

Memakai DB-IP Lite (https://db-ip.com), lisensi Creative Commons Attribution 4.0.
Syarat lisensi: halaman yang menampilkan hasilnya wajib mencantumkan tautan ke DB-IP.com
(sudah ada di frontend halaman Verifikasi).

Dua file disimpan di backend/services/threat/data/ (di-gitignore, tidak ikut ke GitHub):
  dbip-country-lite.mmdb  -> IP ke negara
  dbip-asn-lite.mmdb      -> IP ke penyedia jaringan (ASN)

File diunduh otomatis saat server menyala bila belum ada atau sudah lebih dari 35 hari.
Ini satu kali unduhan per bulan, bukan permintaan API setiap kali link dicek.

Jalankan manual dari folder backend:
  python -m services.threat.data_ip            (unduh bila perlu, lalu tes)
  python -m services.threat.data_ip --paksa    (unduh ulang walau masih baru)
"""

import gzip
import os
import shutil
import sys
import time
from datetime import date
from pathlib import Path

import requests

FOLDER_DATA = Path(__file__).resolve().parent / "data"
BERKAS = {"negara": "dbip-country-lite.mmdb", "asn": "dbip-asn-lite.mmdb"}
SUMBER = {"negara": "dbip-country-lite", "asn": "dbip-asn-lite"}
URL_UNDUH = "https://download.db-ip.com/free/{nama}-{bulan}.mmdb.gz"
UMUR_MAKS_HARI = 35

# Nama kolom penyedia jaringan di file ASN. Format DB-IP mengikuti format MaxMind,
# tapi nama ini belum bisa dipastikan tanpa membuka filenya, jadi dicoba beberapa.
KOLOM_PENYEDIA = ("autonomous_system_organization", "organization", "as_org", "asn_org")


def path_berkas(jenis: str) -> Path:
    return FOLDER_DATA / BERKAS[jenis]


def _bulan_kandidat() -> list[str]:
    """Bulan ini dan bulan lalu, mis. ['2026-11', '2026-10'] (file bulan ini kadang belum terbit)."""
    hari_ini = date.today()
    lalu = date(hari_ini.year - 1, 12, 1) if hari_ini.month == 1 else date(hari_ini.year, hari_ini.month - 1, 1)
    return [hari_ini.strftime("%Y-%m"), lalu.strftime("%Y-%m")]


def _perlu_unduh(path: Path, paksa: bool) -> bool:
    if paksa or not path.exists():
        return True
    umur_hari = (time.time() - path.stat().st_mtime) / 86400
    return umur_hari > UMUR_MAKS_HARI


def _unduh_satu(jenis: str) -> str:
    """Unduh, ekstrak, cek bisa dibuka, lalu ganti file lama. Mengembalikan pesan status."""
    import maxminddb

    FOLDER_DATA.mkdir(parents=True, exist_ok=True)
    tujuan = path_berkas(jenis)
    sementara_gz = tujuan.with_suffix(".mmdb.gz.tmp")
    sementara = tujuan.with_suffix(".mmdb.tmp")
    pesan_gagal = []
    for bulan in _bulan_kandidat():
        url = URL_UNDUH.format(nama=SUMBER[jenis], bulan=bulan)
        try:
            with requests.get(url, stream=True, timeout=60) as r:
                if r.status_code != 200:
                    pesan_gagal.append(f"{bulan}: HTTP {r.status_code}")
                    continue
                with open(sementara_gz, "wb") as f:
                    for potong in r.iter_content(1 << 20):
                        f.write(potong)
            with gzip.open(sementara_gz, "rb") as masuk, open(sementara, "wb") as keluar:
                shutil.copyfileobj(masuk, keluar)
            maxminddb.open_database(str(sementara)).close()   # pastikan file tidak rusak
            os.replace(sementara, tujuan)                     # ganti file lama sekaligus
            return f"{BERKAS[jenis]}: diperbarui dari data {bulan}"
        except Exception as e:
            pesan_gagal.append(f"{bulan}: {type(e).__name__}: {e}")
        finally:
            for p in (sementara_gz, sementara):
                if p.exists():
                    p.unlink()
    return f"{BERKAS[jenis]}: GAGAL diunduh ({'; '.join(pesan_gagal)})"


def perbarui(paksa: bool = False) -> list[str]:
    """Unduh database yang belum ada atau sudah tua. Aman dipanggil berkali-kali."""
    status = []
    for jenis in BERKAS:
        if _perlu_unduh(path_berkas(jenis), paksa):
            status.append(_unduh_satu(jenis))
        else:
            status.append(f"{BERKAS[jenis]}: masih baru, tidak diunduh")
    for s in status:
        print(f"[data_ip] {s}")
    return status


if __name__ == "__main__":
    perbarui(paksa="--paksa" in sys.argv)

    # Tes: tampilkan isi data untuk dua IP publik yang dikenal
    import maxminddb
    for jenis in BERKAS:
        path = path_berkas(jenis)
        if not path.exists():
            print(f"\n{path.name}: belum ada")
            continue
        with maxminddb.open_database(str(path)) as db:
            print(f"\n{path.name}:")
            for ip in ("1.1.1.1", "8.8.8.8"):
                print(f"  {ip} -> {db.get(ip)}")
