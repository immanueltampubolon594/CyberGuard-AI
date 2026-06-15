import ssl
import socket
from urllib.parse import urlparse
from datetime import datetime

def check_ssl_certificate(url: str) -> dict:
    """
    Analisis SSL Certificate untuk deteksi phishing
    """
    result = {
        "has_ssl": False,
        "issuer": "Unknown",
        "subject": "Unknown",
        "valid_from": None,
        "valid_to": None,   
        "days_until_expiry": None,
        "is_self_signed": False,
        "is_lets_encrypt": False,
        "is_ev_ssl": False,
        "is_trusted_issuer": False,
        "is_expired": False,           
        "is_domain_mismatch": False,   
        "score": 0,
        "reasons": []
    }
    
    parsed = urlparse(url)
    domain = parsed.netloc.split(':')[0]
    port = 443
    
    # Cek apakah HTTPS
    if parsed.scheme != "https":
        result["has_ssl"] = False
        result["score"] = 40  # Naikkan sedikit untuk no HTTPS
        result["reasons"].append("Website tidak menggunakan HTTPS (data tidak terenkripsi)")
        return result
    
    result["has_ssl"] = True
    
    try:
        # PENTING: Matikan check_hostname otomatis dulu.
        # Agar kita tetap bisa membaca 'cert' meskipun domainnya mismatch.
        # Nanti kita cek manual mismatch-nya di bawah.
        context = ssl.create_default_context()
        context.check_hostname = False 
        context.verify_mode = ssl.CERT_REQUIRED
        
        with socket.create_connection((domain, port), timeout=5) as sock:
            with context.wrap_socket(sock, server_hostname=domain) as ssock:
                cert = ssock.getpeercert()
                
                if not cert:
                    return result
                
                # Extract issuer & subject
                issuer_dict = dict(x[0] for x in cert.get('issuer', []))
                subject_dict = dict(x[0] for x in cert.get('subject', []))
                
                result["issuer"] = issuer_dict.get("organizationName", 
                               issuer_dict.get("commonName", "Unknown"))
                result["subject"] = subject_dict.get("commonName", domain)
                
                # ==========================================
                # 1. CHECK EXPIRED DATE 
                # ==========================================
                if "notAfter" in cert:
                    try:
                        expiry_date = datetime.strptime(cert["notAfter"], "%b %d %H:%M:%S %Y %Z")
                        days_left = (expiry_date - datetime.now()).days
                        result["days_until_expiry"] = days_left
                        
                        # Set is_expired jika hari minus
                        if days_left < 0:
                            result["is_expired"] = True
                    except Exception:
                        pass
                
                # ==========================================
                # 2. CHECK TRUSTED ISSUER
                # ==========================================
                trusted_issuers = [
                    "DigiCert", "GlobalSign", "Let's Encrypt", "Comodo", 
                    "GeoTrust", "Thawte", "Entrust", "Symantec",
                    "Google Trust Services", "Amazon", "Cloudflare",
                    "Sectigo", "GoDaddy", "Microsoft"
                ]
                
                for trusted in trusted_issuers:
                    if trusted.lower() in result["issuer"].lower():
                        result["is_trusted_issuer"] = True
                        
                        if trusted == "Let's Encrypt":
                            result["is_lets_encrypt"] = True
                            result["score"] = 5
                            result["reasons"].append("SSL gratis Let's Encrypt")
                        else:
                            result["is_ev_ssl"] = True
                            result["score"] = 0
                            result["reasons"].append(f"SSL valid dari {trusted}")
                        break
                
                # Check self-signed
                if not result["is_trusted_issuer"]:
                    if (result["issuer"] == "Unknown" or 
                        result["issuer"].lower() == domain.lower() or
                        result["issuer"] == result["subject"]):
                        result["is_self_signed"] = True
                        result["score"] = 80  # Naikkan jadi 80
                        result["reasons"].append("SSL self-signed (sangat berbahaya)")
                
                # ==========================================
                # 3. CHECK DOMAIN MISMATCH 
                # ==========================================
                try:
                    ssl.match_hostname(cert, domain)
                except ssl.CertificateError:
                    result["is_domain_mismatch"] = True
                    # Jika mismatch, timpa score jadi sangat tinggi
                    result["score"] = max(result["score"], 70) 
                    result["reasons"].append("SSL Certificate tidak match dengan domain (phishing indicator)")

    except ssl.SSLError as e:
        error_msg = str(e).lower()
        
        if "self signed" in error_msg:
            result["is_self_signed"] = True
            result["score"] = 80
            result["reasons"].append("SSL self-signed")
        elif "certificate verify failed" in error_msg:
            result["score"] = 40
            result["reasons"].append("SSL verification failed")
        else:
            result["score"] = 35
            result["reasons"].append(f"SSL Error: {str(e)[:50]}")
            
    except socket.timeout:
        result["score"] = 0
        result["reasons"].append("SSL check timeout")
    except Exception as e:
        result["score"] = 0
        result["reasons"].append(f"SSL check error: {str(e)[:50]}")
    
    return result