import os
import re
import socket
import requests
import base64
import tldextract
from dotenv import load_dotenv
from urllib.parse import urlparse
from pathlib import Path

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
from .threat import microlink
from .threat import ssl_checker
from .threat import url_resolver


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

        results = {}
        original_url = url

        # STEP 0: URL RESOLVER
        print("\n[0/8] Mengecek URL shortener...")
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
        print("\n[1/8] Validasi struktur URL...")
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
            print(f"URL INVALID/TYPO - Domain tidak ditemukan")
            return {
                "score": 0, "level": "NOT_FOUND",
                "reasons": ["URL tidak memiliki struktur yang valid", "Domain tidak dapat ditemukan di internet"],
                "summary": "Alamat website yang Anda masukkan tidak dapat ditemukan di internet.",
                "recommendation": "Mohon periksa kembali ejaan URL Anda.",
                "is_valid_url": False, "screenshot": None,
                "url_expansion": results.get("url_expansion")
            }
        print(f"   Struktur URL valid")

        # STEP 2: SCREENSHOT
        print("\n[2/8] Mengambil screenshot...")
        try:
            screenshot_url = microlink.capture_screenshot(url)
            results["screenshot"] = screenshot_url
            print(f"   Berhasil" if screenshot_url else "   Gagal")
        except Exception as e:
            print(f"   Error: {e}")
            results["screenshot"] = None

        # STEP 3: SSL
        print("\n[3/8] Analisis SSL Certificate...")
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

        # STEP 4: ANALISIS KEAMANAN
        print("\n[4/8] Analisis keamanan...")

        try:
            results["heuristic"] = heuristic.heuristic_analysis(url)
            print(f"   Heuristic: {results['heuristic']['score']} poin")
        except Exception as e:
            results["heuristic"] = {"score": 0, "reasons": []}

        if self.gsb_key:
            try:
                results["google"] = google_safe.check_google_safe(url, self.gsb_key)
                print(f"   Google Safe: {'Terdeteksi' if results['google'].get('malicious') else 'Clean'}")
            except Exception as e:
                results["google"] = {"malicious": False, "score": 0}
        else:
            results["google"] = {"malicious": False, "score": 0}

        if self.vt_key:
            try:
                results["virustotal"] = virustotal.check_virustotal(url, self.vt_key)
                malicious = results['virustotal'].get('malicious', 0)
                print(f"   VirusTotal: {malicious} malicious")
            except Exception as e:
                results["virustotal"] = {"malicious": 0, "suspicious": 0, "score": 0}
        else:
            results["virustotal"] = {"malicious": 0, "suspicious": 0, "score": 0}

        try:
            results["urlhaus"] = urlhaus.check_urlhaus(url)
            print(f"   URLHaus: {'Terdeteksi' if results['urlhaus'].get('malicious') else 'Clean'}")
        except Exception as e:
            results["urlhaus"] = {"malicious": False, "score": 0}

        if self.urlscan_key:
            try:
                results["urlscan"] = urlscan.check_urlscan(url, self.urlscan_key)
                print(f"   URLScan: {'Mencurigakan' if results['urlscan'].get('malicious') else 'Clean'}")
            except Exception as e:
                results["urlscan"] = {"malicious": False, "score": 0}
        else:
            results["urlscan"] = {"malicious": False, "score": 0}

        try:
            results["phishtank"] = phishtank.check_phishtank(url)
            pt_status = "VERIFIED PHISHING" if results['phishtank'].get('verified') else \
                "In Database" if results['phishtank'].get('in_database') else "Clean"
            print(f"   PhishTank: {pt_status}")
        except Exception as e:
            print(f"   PhishTank Error: {e}")
            results["phishtank"] = {"malicious": False, "score": 0, "reason": str(e)}

        try:
            parsed = urlparse(url)
            hostname = parsed.netloc.split(':')[0]
            if self.abuseipdb_key:
                if re.match(r"^(\d{1,3}\.){3}\d{1,3}$", hostname):
                    results["abuseipdb"] = abuseipdb.check_ip(hostname, self.abuseipdb_key)
                else:
                    ip_address = self._resolve_domain_to_ip(hostname)
                    if ip_address:
                        results["abuseipdb"] = abuseipdb.check_ip(ip_address, self.abuseipdb_key)
                    else:
                        results["abuseipdb"] = {"malicious": False, "score": 0}
            else:
                results["abuseipdb"] = {"malicious": False, "score": 0}
            print(f"   AbuseIPDB: Checked")
        except Exception as e:
            results["abuseipdb"] = {"malicious": False, "score": 0}

        if self.whois_key:
            try:
                results["whois"] = whois.check_whois(url, self.whois_key)
                age = results['whois'].get('age_days')
                print(f"   WHOIS: {age if age else 'N/A'} days")
            except Exception as e:
                results["whois"] = {"domain": "", "age_days": None}
        else:
            results["whois"] = {"domain": "", "age_days": None}

        # STEP 5: SKOR FINAL
        print("\n[5/8] Menghitung skor risiko...")
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

        print(f"\n{'='*60}")
        print(f"HASIL ANALISIS: {color_status} ({score}%)")
        print(f"{'='*60}\n")

        return final