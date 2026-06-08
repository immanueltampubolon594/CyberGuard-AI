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
        "score": 0,
        "reasons": []
    }
    
    parsed = urlparse(url)
    domain = parsed.netloc.split(':')[0]
    port = 443
    
    # Cek apakah HTTPS
    if parsed.scheme != "https":
        result["has_ssl"] = False
        result["score"] = 30
        result["reasons"].append("Website tidak menggunakan HTTPS")
        return result
    
    result["has_ssl"] = True
    
    try:
        # ✅ SSL Context yang BENAR
        context = ssl.create_default_context()
        context.check_hostname = True
        context.verify_mode = ssl.CERT_REQUIRED
        
        with socket.create_connection((domain, port), timeout=5) as sock:
            with context.wrap_socket(sock, server_hostname=domain) as ssock:
                cert = ssock.getpeercert()
                
                if not cert:
                    return result
                
                # Extract issuer
                issuer_dict = dict(x[0] for x in cert.get('issuer', []))
                subject_dict = dict(x[0] for x in cert.get('subject', []))
                
                result["issuer"] = issuer_dict.get("organizationName", 
                               issuer_dict.get("commonName", "Unknown"))
                result["subject"] = subject_dict.get("commonName", domain)
                
                # Check validity
                if "notAfter" in cert:
                    try:
                        expiry_date = datetime.strptime(cert["notAfter"], "%b %d %H:%M:%S %Y %Z")
                        days_left = (expiry_date - datetime.now()).days
                        result["days_until_expiry"] = days_left
                    except:
                        pass
                
                # ✅ Trusted CA Issuers (TIDAK BOLEH SELF-SIGNED)
                trusted_issuers = [
                    "DigiCert", "GlobalSign", "Let's Encrypt", "Comodo", 
                    "GeoTrust", "Thawte", "Entrust", "Symantec",
                    "Google Trust Services", "Amazon", "Cloudflare",
                    "Sectigo", "GoDaddy"
                ]
                
                # Check trusted issuer
                for trusted in trusted_issuers:
                    if trusted in result["issuer"]:
                        result["is_trusted_issuer"] = True
                        
                        if trusted == "Let's Encrypt":
                            result["is_lets_encrypt"] = True
                            # Let's Encrypt = OK, tapi gratis (sedikit score)
                            result["score"] = 5
                            result["reasons"].append("SSL gratis Let's Encrypt")
                        else:
                            result["is_ev_ssl"] = True
                            # Trusted PAID SSL = 0 score!
                            result["score"] = 0
                            result["reasons"].append(f"SSL valid dari {trusted}")
                        break
                
                # Check self-signed (HANYA jika bukan trusted issuer)
                if not result["is_trusted_issuer"]:
                    if (result["issuer"] == "Unknown" or 
                        result["issuer"] == domain or
                        result["issuer"] == result["subject"]):
                        result["is_self_signed"] = True
                        result["score"] = 60  # HIGH RISK!
                        result["reasons"].append("SSL self-signed (tidak valid)")
                
    except ssl.SSLError as e:
        error_msg = str(e).lower()
        
        # ✅ Handle specific SSL errors
        if "self signed" in error_msg:
            result["is_self_signed"] = True
            result["score"] = 60
            result["reasons"].append("SSL self-signed")
        elif "certificate verify failed" in error_msg:
            result["score"] = 40
            result["reasons"].append("SSL verification failed")
        else:
            result["score"] = 35
            result["reasons"].append(f"SSL Error")
            
    except socket.timeout:
        result["score"] = 0  # Timeout = jangan tambah score
        result["reasons"].append("SSL check timeout")
    except Exception as e:
        result["score"] = 0  # Error lain = jangan tambah score
        result["reasons"].append("SSL check error")
    
    return result