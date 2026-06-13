import os
import re
import socket
import time  # TAMBAHAN UNTUK CACHE
import requests
import base64
import tldextract
from dotenv import load_dotenv
from urllib.parse import urlparse
from pathlib import Path
from .threat import content_analyzer

base_dir = Path(__file__).resolve().parent.parent
env_path = base_dir / '.env'
load_dotenv(dotenv_path=env_path)

print(f"VT Key: {'UP' if os.getenv('VIRUSTOTAL_API_KEY') else 'KOSONG'}")
print(f"GSB Key: {'UP' if os.getenv('GOOGLE_SAFE_BROWSING_KEY') else 'KOSONG'}")
print(f"URLScan Key: {'UP' if os.getenv('URLSCAN_API_KEY') else 'KOSONG'}")
print(f"Microlink: UP (GRATIS)")
print(f"SSL Checker: UP")
print(f"URL Resolver: UP")
print(f"PhishTank: UP (Public API)")

from .threat import heuristic, google_safe, virustotal
from .threat import urlhaus, urlscan, risk_engine
from .threat import abuseipdb, whois, phishtank
from .threat import microlink
from .threat import ssl_checker
from .threat import url_resolver

# ============================================
# SISTEM CACHE & GRACEFUL DEGRADATION
# ============================================
URL_CACHE = {}
CACHE_TTL = 3600  # Simpan cache selama 1 jam (3600 detik)
API_FAILURE_CACHE = {}  # Track API yang sedang kena limit (Cooldown)

def get_cached_result(url: str):
    """Cek apakah URL ada di cache dan belum expired"""
    if url in URL_CACHE:
        cached_data, timestamp = URL_CACHE[url]
        if time.time() - timestamp < CACHE_TTL:
            return cached_data
        else:
            del URL_CACHE[url]
    return None

def save_to_cache(url: str, result: dict):
    """Simpan hasil analisis ke cache"""
    URL_CACHE[url] = (result, time.time())

def safe_api_call(api_name: str, func, fallback_result: dict = None):
    """
    Wrapper API agar tidak crash jika limit (HTTP 403/429).
    Jika limit, masuk cooldown 5 menit dan return fallback.
    """
    if fallback_result is None:
        fallback_result = {"malicious": False, "score": 0, "skipped": True}
    
    # Cek apakah API ini sedang dalam masa cooldown (limit)
    if API_FAILURE_CACHE.get(api_name, 0) > time.time() - 300:  # 5 menit cooldown
        return fallback_result

    try:
        result = func()
        # Cek jika hasil mengandung indikasi limit
        reason = str(result.get("reason", "")).lower() if isinstance(result, dict) else ""
        if "403" in reason or "429" in reason or "limit" in reason:
            API_FAILURE_CACHE[api_name] = time.time()
            fallback_result["reason"] = f"{api_name} Rate Limit"
            return fallback_result
        return result
    except Exception as e:
        error_msg = str(e).lower()
        if "403" in error_msg or "429" in error_msg or "limit" in error_msg:
            API_FAILURE_CACHE[api_name] = time.time()
            fallback_result["reason"] = f"{api_name} Rate Limit"
        return fallback_result


class ThreatAnalyzer:
    """Orchestrator utama untuk analisis ancaman URL"""

    def __init__(self):
        self.vt_key = os.getenv("VIRUSTOTAL_API_KEY")
        self.gsb_key = os.getenv("GOOGLE_SAFE_BROWSING_KEY")
        self.urlscan_key = os.getenv("URLSCAN_API_KEY")
        self.abuseipdb_key = os.getenv("ABUSEIPDB_API_KEY")
        self.whois_key = os.getenv("WHOISXML_API_KEY")

    def _resolve_domain_to_ip(self, domain: str) -> str | None:
        try:
            return socket.gethostbyname(domain)
        except socket.gaierror:
            return None

    def _is_valid_url_structure(self, url: str) -> dict:
        try:
            parsed = urlparse(url)
            hostname = parsed.netloc.split(':')[0].lower()
            extracted = tldextract.extract(url)
            has_valid_tld = bool(extracted.suffix and len(extracted.suffix) >= 2)
            ip_address = self._resolve_domain_to_ip(hostname) if hostname else None
            dns_resolves = ip_address is not None
            domain = extracted.domain.lower()
            is_random_looking = False
            if domain:
                vowels = set('aeiou')
                v_count = sum(1 for c in domain if c in vowels)
                if len(domain) > 5 and v_count == 0:
                    is_random_looking = True
                if re.search(r'[bcdfghjklmnpqrstvwxyz]{4,}', domain):
                    is_random_looking = True
            return {
                "has_valid_tld": has_valid_tld,
                "dns_resolves": dns_resolves,
                "is_random_looking": is_random_looking,
                "hostname": hostname,
                "ip_address": ip_address
            }
        except Exception as e:
            print(f"URL validation error: {e}")
            return {
                "has_valid_tld": False,
                "dns_resolves": False,
                "is_random_looking": True,
                "hostname": "",
                "ip_address": None
            }

    async def analyze(self, url: str):
        """Main analysis function - Orchestrator untuk semua engine"""

        url_pattern = re.compile(
            r'https?://[^\s]+|www\.[^\s]+|[^\s]+\.(com|net|org|id|io|co|gov|edu)[^\s]*',
            re.IGNORECASE
        )
        url_match = url_pattern.search(url)

        if not url_match:
            return {
                "score": 0,
                "level": "NOT_URL",
                "reasons": [],
                "is_valid_url": False,
                "screenshot": None
            }

        url = url_match.group(0)
        print(f"\n{'='*60}")
        print(f"[*] Menganalisis URL: {url}")
        print(f"{'='*60}")

        # ============================================
        # STEP 0.1: CEK CACHE DULU! (INSTANT)
        # ============================================
        cached_result = get_cached_result(url)
        if cached_result:
            print(f"\n[CACHE HIT] Hasil diambil dari memori! (Skip semua API calls)")
            return cached_result

        results = {}
        original_url = url

        # STEP 0: URL RESOLVER
        print("\n[0/6] Mengecek URL shortener...")
        try:
            if url_resolver.is_shortened_url(url):
                expanded = url_resolver.expand_url(url)
                if expanded.get('expanded_url') and expanded['expanded_url'] != url:
                    original_url = url
                    url = expanded['expanded_url']
                    results["url_expansion"] = {
                        "original": original_url, "expanded": url,
                        "redirect_chain": expanded.get('redirect_chain', []),
                        "hops": len(expanded.get('redirect_chain', [])),
                        "is_shortened": True
                    }
                    print(f"   Expanded: {url}")
                else:
                    results["url_expansion"] = {
                        "original": url, "expanded": url,
                        "is_shortened": True, "error": expanded.get('error', 'Unknown')
                    }
            else:
                results["url_expansion"] = {"original": url, "expanded": url, "is_shortened": False}
                print(f"   Bukan URL shortener")
        except Exception as e:
            print(f"   URL Resolver Error: {e}")
            results["url_expansion"] = {"original": url, "expanded": url, "is_shortened": False, "error": str(e)}

        # STEP 1: VALIDASI URL
        print("\n[1/6] Validasi struktur URL...")
        url_validation = self._is_valid_url_structure(url)
        results["url_validation"] = url_validation

        invalid_signals = 0
        if not url_validation["has_valid_tld"]:
            invalid_signals += 1
        if not url_validation["dns_resolves"]:
            invalid_signals += 1
        if url_validation["is_random_looking"]:
            invalid_signals += 1

        if invalid_signals >= 2:
            print(f"   URL INVALID/TYPO - Domain tidak ditemukan")
            not_found_result = {
                "score": 0, "level": "NOT_FOUND",
                "reasons": ["URL tidak memiliki struktur yang valid", "Domain tidak dapat ditemukan di internet"],
                "summary": "Alamat website yang Anda masukkan tidak dapat ditemukan di internet.",
                "recommendation": "Mohon periksa kembali ejaan URL Anda.",
                "is_valid_url": False, "screenshot": None,
                "url_expansion": results.get("url_expansion")
            }
            save_to_cache(url, not_found_result) # Cache yang invalid juga
            return not_found_result
        print(f"   Struktur URL valid")

        # STEP 2: SCREENSHOT
        print("\n[2/6] Mengambil screenshot...")
        try:
            screenshot_url = microlink.capture_screenshot(url)
            results["screenshot"] = screenshot_url
            print(f"   Berhasil" if screenshot_url else "   Gagal")
        except Exception as e:
            print(f"   Error: {e}")
            results["screenshot"] = None

        # STEP 3: SSL
        print("\n[3/6] Analisis SSL Certificate...")
        try:
            results["ssl"] = ssl_checker.check_ssl_certificate(url)
            ssl_score = results['ssl']['score']
            issuer = results['ssl']['issuer']
            is_self_signed = results['ssl']['is_self_signed']
            if is_self_signed:
                print(f"   SSL: Self-signed (berbahaya!)")
            elif issuer == "Unknown":
                print(f"   SSL: Tidak terdeteksi")
            else:
                print(f"   SSL: {issuer} ({ssl_score} poin)")
        except Exception as e:
            print(f"   SSL Error: {e}")
            results["ssl"] = {"score": 0, "reasons": []}

        # ============================================
        # STEP 4: ANALISIS KEAMANAN (DENGAN FALLBACK LIMIT)
        # ============================================
        print("\n[4/6] Analisis keamanan...")

        # Content Analyzer (Membaca isi website untuk deteksi Piracy/Judi)
        results["content_analyzer"] = safe_api_call(
            "ContentAnalyzer",
            lambda: content_analyzer.analyze_content(url)
        )
        if not results["content_analyzer"].get("skipped"):
            if results["content_analyzer"].get("malicious"):
                print(f"   Content: {results['content_analyzer']['category']} (Terdeteksi)")
            else:
                print(f"   Content: Clean")

        # 1. Heuristic (Lokal, tidak butuh wrapper)
        try:
            results["heuristic"] = heuristic.heuristic_analysis(url)
            print(f"   Heuristic: {results['heuristic']['score']} poin")
        except Exception as e:
            results["heuristic"] = {"score": 0, "reasons": []}

        # 2. Google Safe Browsing
        if self.gsb_key:
            results["google"] = safe_api_call("Google Safe", lambda: google_safe.check_google_safe(url, self.gsb_key))
            if not results["google"].get("skipped"):
                print(f"   Google Safe: {'Terdeteksi' if results['google'].get('malicious') else 'Clean'}")
            else:
                print(f"   Google Safe: SKIP (Limit/Error)")
        else:
            results["google"] = {"malicious": False, "score": 0}

        # 3. VirusTotal
        if self.vt_key:
            results["virustotal"] = safe_api_call("VirusTotal", lambda: virustotal.check_virustotal(url, self.vt_key))
            if not results["virustotal"].get("skipped"):
                malicious = results['virustotal'].get('malicious', 0)
                print(f"   VirusTotal: {malicious} malicious")
            else:
                print(f"   VirusTotal: SKIP (Limit/Error)")
        else:
            results["virustotal"] = {"malicious": 0, "suspicious": 0, "score": 0}

        # 4. URLHaus (Unlimited, no wrapper needed)
        try:
            results["urlhaus"] = urlhaus.check_urlhaus(url)
            print(f"   URLHaus: {'Terdeteksi' if results['urlhaus'].get('malicious') else 'Clean'}")
        except Exception as e:
            results["urlhaus"] = {"malicious": False, "score": 0}

        # 5. URLScan
        if self.urlscan_key:
            results["urlscan"] = safe_api_call("URLScan", lambda: urlscan.check_urlscan(url, self.urlscan_key))
            if not results["urlscan"].get("skipped"):
                print(f"   URLScan: {'Mencurigakan' if results['urlscan'].get('malicious') else 'Clean'}")
            else:
                print(f"   URLScan: SKIP (Limit/Error)")
        else:
            results["urlscan"] = {"malicious": False, "score": 0}

        # 6. PhishTank
        results["phishtank"] = safe_api_call("PhishTank", lambda: phishtank.check_phishtank(url))
        if not results["phishtank"].get("skipped"):
            pt_status = "VERIFIED PHISHING" if results['phishtank'].get('verified') else \
                "In Database" if results['phishtank'].get('in_database') else "Clean"
            print(f"   PhishTank: {pt_status}")
        else:
            print(f"   PhishTank: SKIP (Limit 403/429)")

        # 7. AbuseIPDB
        try:
            parsed = urlparse(url)
            hostname = parsed.netloc.split(':')[0]
            if self.abuseipdb_key:
                if re.match(r"^(\d{1,3}\.){3}\d{1,3}$", hostname):
                    results["abuseipdb"] = safe_api_call("AbuseIPDB", lambda: abuseipdb.check_ip(hostname, self.abuseipdb_key))
                else:
                    ip_address = self._resolve_domain_to_ip(hostname)
                    if ip_address:
                        results["abuseipdb"] = safe_api_call("AbuseIPDB", lambda: abuseipdb.check_ip(ip_address, self.abuseipdb_key))
                    else:
                        results["abuseipdb"] = {"malicious": False, "score": 0}
            else:
                results["abuseipdb"] = {"malicious": False, "score": 0}
            
            if not results["abuseipdb"].get("skipped"):
                print(f"   AbuseIPDB: Checked")
            else:
                print(f"   AbuseIPDB: SKIP (Limit)")
        except Exception as e:
            results["abuseipdb"] = {"malicious": False, "score": 0}

        # 8. WHOIS
        if self.whois_key:
            results["whois"] = safe_api_call("WHOIS", lambda: whois.check_whois(url, self.whois_key))
            if not results["whois"].get("skipped"):
                age = results['whois'].get('age_days')
                print(f"   WHOIS: {age if age else 'N/A'} days")
            else:
                print(f"   WHOIS: SKIP (Limit)")
        else:
            results["whois"] = {"domain": "", "age_days": None}

        # STEP 5: SKOR FINAL
        print("\n[5/6] Menghitung skor risiko...")
        final = risk_engine.calculate_risk(results, url=url)

        if "screenshot" not in final or final.get("screenshot") is None:
            final["screenshot"] = results.get("screenshot")
        if "is_valid_url" not in final:
            final["is_valid_url"] = True
        if results.get("url_expansion"):
            final["url_expansion"] = results["url_expansion"]
        if results.get("ssl"):
            final["ssl"] = results["ssl"]

        score = final.get('score', 0)
        if score >= 75:
            color_status = "BERBAHAYA"
        elif score >= 40:
            color_status = "MENCURIGAKAN"
        elif score >= 25:
            color_status = "WASPADA"
        else:
            color_status = "AMAN"

        # ============================================
        # STEP 6: SIMPAN KE CACHE SEBELUM RETURN
        # ============================================
        save_to_cache(url, final)

        print(f"\n{'='*60}")
        print(f"HASIL ANALISIS: {color_status} ({score}%)")
        print(f"Disimpan ke cache (Berlaku {CACHE_TTL}s)")
        print(f"{'='*60}\n")

        return final