

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

print(f"🔑 VT Key: {'UP' if os.getenv('VIRUSTOTAL_API_KEY') else 'KOSONG'}")
print(f"🔑 GSB Key: {'UP' if os.getenv('GOOGLE_SAFE_BROWSING_KEY') else 'KOSONG'}")
print(f"🔑 URLScan Key: {'UP' if os.getenv('URLSCAN_API_KEY') else 'KOSONG'}")
print(f"🔑 Microlink: UP (GRATIS)")
print(f"🔒 SSL Checker: UP")
print(f"🔗 URL Resolver: UP")
print(f"🎣 PhishTank: UP (Public API)")

from .threat import heuristic, google_safe, virustotal, urlhaus, urlscan, risk_engine, abuseipdb, whois, phishtank
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
        """Coba resolve domain ke IP address"""
        try:
            return socket.gethostbyname(domain)
        except socket.gaierror:
            return None

    def _is_valid_url_structure(self, url: str) -> dict:
        """Validasi struktur URL untuk mendeteksi typo/random string"""
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
                consonants = set('bcdfghjklmnpqrstvwxyz')
                
                v_count = sum(1 for c in domain if c in vowels)
                c_count = sum(1 for c in domain if c in consonants)
                
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
            print(f"⚠️  URL validation error: {e}")
            return {
                "has_valid_tld": False,
                "dns_resolves": False,
                "is_random_looking": True,
                "hostname": "",
                "ip_address": None
            }

    def analyze(self, url: str):
        """Main analysis function - Orchestrator untuk semua engine"""
        print(f"\n{'='*60}")
        print(f"[*] Menganalisis URL: {url}")
        print(f"{'='*60}")
        
        results = {}
        original_url = url
        
        # ============================================
        # STEP 0: URL RESOLVER (EXPAND SHORTENER)
        # ============================================
        print("\n🔗 [0/8] Mengecek URL shortener...")
        try:
            if url_resolver.is_shortened_url(url):
                print(f"   🔗 URL shortener terdeteksi, expanding...")
                expanded = url_resolver.expand_url(url)
                
                if expanded.get('expanded_url') and expanded['expanded_url'] != url:
                    original_url = url
                    url = expanded['expanded_url']
                    
                    results["url_expansion"] = {
                        "original": original_url,
                        "expanded": url,
                        "redirect_chain": expanded.get('redirect_chain', []),
                        "hops": len(expanded.get('redirect_chain', [])),
                        "is_shortened": True
                    }
                    
                    print(f"   ✅ Expanded: {url}")
                    print(f"   🔀 Redirect hops: {results['url_expansion']['hops']}")
                else:
                    results["url_expansion"] = {
                        "original": url,
                        "expanded": url,
                        "is_shortened": True,
                        "error": expanded.get('error', 'Unknown')
                    }
                    print(f"   ⚠️  Gagal expand: {expanded.get('error', 'Unknown')}")
            else:
                results["url_expansion"] = {
                    "original": url,
                    "expanded": url,
                    "is_shortened": False
                }
                print(f"   ✅ Bukan URL shortener")
        except Exception as e:
            print(f"   ❌ URL Resolver Error: {e}")
            results["url_expansion"] = {
                "original": url,
                "expanded": url,
                "is_shortened": False,
                "error": str(e)
            }

        # ============================================
        # STEP 1: VALIDASI URL STRUKTUR
        # ============================================
        print("\n📋 [1/8] Validasi struktur URL...")
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
            print(f"⚠️  URL INVALID/TYPO - Domain tidak ditemukan")
            return {
                "score": 0,
                "level": "NOT_FOUND",
                "reasons": [
                    "URL tidak memiliki struktur yang valid",
                    "Domain tidak dapat ditemukan di internet"
                ],
                "summary": "Alamat website yang Anda masukkan tidak dapat ditemukan di internet.",
                "recommendation": "Mohon periksa kembali ejaan URL Anda.",
                "is_valid_url": False,
                "screenshot": None,
                "url_expansion": results.get("url_expansion")
            }
        print(f"   ✅ Struktur URL valid")

        # ============================================
        # STEP 2: AMBIL SCREENSHOT (MICROLINK)
        # ============================================
        print("\n📸 [2/8] Mengambil screenshot...")
        try:
            screenshot_url = microlink.capture_screenshot(url)
            results["screenshot"] = screenshot_url
            print(f"   ✅ Berhasil" if screenshot_url else "   ⚠️  Gagal")
        except Exception as e:
            print(f"   ❌ Error: {e}")
            results["screenshot"] = None

        # ============================================
        # STEP 3: SSL CERTIFICATE CHECK
        # ============================================
        print("\n🔒 [3/8] Analisis SSL Certificate...")
        try:
            results["ssl"] = ssl_checker.check_ssl_certificate(url)
            ssl_score = results['ssl']['score']
            issuer = results['ssl']['issuer']
            is_self_signed = results['ssl']['is_self_signed']
            
            if is_self_signed:
                print(f"   ⚠️  SSL: Self-signed (berbahaya!)")
            elif issuer == "Unknown":
                print(f"   ⚠️  SSL: Tidak terdeteksi")
            else:
                print(f"   ✅ SSL: {issuer} ({ssl_score} poin)")
        except Exception as e:
            print(f"   ❌ SSL Error: {e}")
            results["ssl"] = {"score": 0, "reasons": []}

        # ============================================
        # STEP 4: ANALISIS KEAMANAN (MULTI-ENGINE)
        # ============================================
        print("\n🔍 [4/8] Analisis keamanan...")

        # 4.1 Heuristik
        try:
            results["heuristic"] = heuristic.heuristic_analysis(url)
            h_score = results['heuristic']['score']
            h_reasons = len(results['heuristic'].get('reasons', []))
            print(f"   ✅ Heuristic: {h_score} poin ({h_reasons} temuan)")
        except Exception as e:
            print(f"   ❌ Heuristic Error: {e}")
            results["heuristic"] = {"score": 0, "reasons": []}

        # 4.2 Google Safe Browsing
        if self.gsb_key:
            try:
                results["google"] = google_safe.check_google_safe(url, self.gsb_key)
                status = "⚠️  Terdeteksi" if results['google'].get('malicious') else "✅ Clean"
                print(f"   ✅ Google Safe: {status}")
            except Exception as e:
                print(f"   ⚠️  GSB Error: {e}")
                results["google"] = {"malicious": False, "score": 0}
        else:
            results["google"] = {"malicious": False, "score": 0}

        # 4.3 VirusTotal
        if self.vt_key:
            try:
                results["virustotal"] = virustotal.check_virustotal(url, self.vt_key)
                malicious = results['virustotal'].get('malicious', 0)
                status = f"⚠️  {malicious} malicious" if malicious > 0 else "✅ Clean"
                print(f"   ✅ VirusTotal: {status}")
            except Exception as e:
                print(f"   ⚠️  VT Error: {e}")
                results["virustotal"] = {"malicious": 0, "suspicious": 0, "score": 0}
        else:
            results["virustotal"] = {"malicious": 0, "suspicious": 0, "score": 0}

        # 4.4 URLHaus
        try:
            results["urlhaus"] = urlhaus.check_urlhaus(url)
            status = "⚠️  Terdeteksi" if results['urlhaus'].get('malicious') else "✅ Clean"
            print(f"   ✅ URLHaus: {status}")
        except Exception as e:
            results["urlhaus"] = {"malicious": False, "score": 0}

        # 4.5 URLScan
        if self.urlscan_key:
            try:
                results["urlscan"] = urlscan.check_urlscan(url, self.urlscan_key)
                status = "⚠️  Mencurigakan" if results['urlscan'].get('malicious') else "✅ Clean"
                print(f"   ✅ URLScan: {status}")
            except Exception as e:
                results["urlscan"] = {"malicious": False, "score": 0}
        else:
            results["urlscan"] = {"malicious": False, "score": 0}


       # 4.6 PhishTank 
        try:
            results["phishtank"] = phishtank.check_phishtank(url)
            pt_status = "🚨 VERIFIED" if results['phishtank'].get('verified') else \
                       "⚠️  In Database" if results['phishtank'].get('in_database') else "✅ Clean"
            print(f"   ✅ PhishTank: {pt_status}")
        except Exception as e:
            print(f"   ❌ PhishTank Error: {e}")
            results["phishtank"] = {"malicious": False, "score": 0, "reason": str(e)}

        # 4.7 AbuseIPDB
        try:
            parsed = urlparse(url)
            hostname = parsed.netloc.split(':')[0]
            
            if self.abuseipdb_key:
                if re.match(r"^(\d{1,3}\.){3}\d{1,3}$", hostname):
                    try:
                        results["abuseipdb"] = abuseipdb.check_ip(hostname, self.abuseipdb_key)
                        print(f"   ✅ AbuseIPDB: Checked")
                    except Exception as e:
                        results["abuseipdb"] = {"malicious": False, "score": 0}
                else:
                    ip_address = self._resolve_domain_to_ip(hostname)
                    if ip_address:
                        try:
                            results["abuseipdb"] = abuseipdb.check_ip(ip_address, self.abuseipdb_key)
                            print(f"   ✅ AbuseIPDB: Checked")
                        except Exception as e:
                            results["abuseipdb"] = {"malicious": False, "score": 0}
                    else:
                        results["abuseipdb"] = {"malicious": False, "score": 0}
            else:
                results["abuseipdb"] = {"malicious": False, "score": 0}
        except Exception as e:
            results["abuseipdb"] = {"malicious": False, "score": 0}

        # 4.8 WHOIS
        if self.whois_key:
            try:
                results["whois"] = whois.check_whois(url, self.whois_key)
                age = results['whois'].get('age_days')
                print(f"   ✅ WHOIS: {age if age else 'N/A'} days")
            except Exception as e:
                results["whois"] = {"domain": "", "age_days": None}
        else:
            results["whois"] = {"domain": "", "age_days": None}

        # ============================================
        # STEP 5: HITUNG SKOR FINAL
        # ============================================
        print("\n📊 [5/8] Menghitung skor risiko...")
        final = risk_engine.calculate_risk(results, url=url)
        
        # Pastikan screenshot ada di final result
        if "screenshot" not in final or final.get("screenshot") is None:
            final["screenshot"] = results.get("screenshot")
        
        # Pastikan is_valid_url ada
        if "is_valid_url" not in final:
            final["is_valid_url"] = True
        
        # Tambahkan info URL expansion
        if results.get("url_expansion"):
            final["url_expansion"] = results["url_expansion"]
        
        # Tambahkan info SSL
        if results.get("ssl"):
            final["ssl"] = results["ssl"]
        
        # ============================================
        # FINAL OUTPUT
        # ============================================
        score = final.get('score', 0)
        level = final.get('level', 'UNKNOWN')
        
        if score >= 75:
            color_status = "🔴 BERBAHAYA"
        elif score >= 40:
            color_status = "🟠 MENCURIGAKAN"
        elif score >= 25:
            color_status = "🟡 WASPADA"
        else:
            color_status = "🟢 AMAN"
        
        print(f"\n{'='*60}")
        print(f"📊 HASIL ANALISIS")
        print(f"{'='*60}")
        print(f"   Skor: {score}%")
        print(f"   Status: {color_status}")
        print(f"   Screenshot: {'✅ Ada' if final.get('screenshot') else '❌ Tidak ada'}")
        if results.get("url_expansion", {}).get("is_shortened"):
            print(f"   URL Shortener: ✅ Terdeteksi & Expanded")
        if results.get("ssl"):
            print(f"   SSL: {results['ssl']['issuer']}")
        print(f"{'='*60}\n")

        return final