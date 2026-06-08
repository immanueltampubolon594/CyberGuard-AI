"""
PhishTank Integration - Phishing Detection API
===============================================
Check URL against PhishTank database (largest phishing database)
NO API KEY REQUIRED - menggunakan public endpoint

Features:
- Auto-detect phishing URLs
- Community-verified results
- Real-time database check
- No API key needed
"""

import base64
import requests
from typing import Dict


def check_phishtank(url: str) -> Dict:
    """
    Cek URL terhadap database PhishTank
    
    Args:
        url: URL yang akan dicek
        
    Returns:
        dict: {
            "malicious": bool,
            "score": int (0-100),
            "in_database": bool,
            "verified": bool,
            "phish_id": str or None,
            "target": str or None,
            "details_url": str or None,
            "reason": str
        }
    """
    result = {
        "malicious": False,
        "score": 0,
        "in_database": False,
        "verified": False,
        "phish_id": None,
        "target": None,
        "details_url": None,
        "reason": ""
    }
    
    try:
        # Encode URL ke base64 (required oleh PhishTank API)
        encoded_url = base64.b64encode(url.encode('utf-8')).decode('utf-8')
        
        # Request ke PhishTank API (TANPA API KEY - public endpoint)
        response = requests.post(
            "https://checkurl.phishtank.com/checkurl/",
            data={
                "url": encoded_url,
                "format": "json"
                # ✅ Tidak perlu app_key!
            },
            timeout=10,
            headers={
                "User-Agent": "CyberGuard AI Security Scanner/1.0"
            }
        )
        
        # Check response status
        if response.status_code != 200:
            result["reason"] = f"PhishTank HTTP {response.status_code}"
            print(f"⚠️  PhishTank: HTTP {response.status_code}")
            return result
        
        data = response.json()
        
        # Parse response
        if "results" not in data:
            result["reason"] = "Response tidak valid"
            print("⚠️  PhishTank: Response tidak valid")
            return result
        
        results = data["results"]
        
        # Check apakah URL ada di database
        if not results.get("in_database"):
            result["reason"] = "URL tidak ada di database PhishTank"
            print("✅ PhishTank: URL tidak ada di database")
            return result
        
        # URL ada di database
        result["in_database"] = True
        result["phish_id"] = results.get("phish_id")
        result["target"] = results.get("target")
        result["details_url"] = results.get("phish_detail_url")
        
        # Check apakah sudah diverifikasi oleh community
        if results.get("verified"):
            result["verified"] = True
            result["malicious"] = True
            result["score"] = 100
            result["reason"] = f"PhishTank: VERIFIED phishing (ID: {result['phish_id']})"
            print(f" PhishTank: URL terdeteksi sebagai phishing (ID: {result['phish_id']})")
        else:
            # Ada di database tapi belum diverifikasi
            result["score"] = 50
            result["reason"] = f"PhishTank: Ada di database tapi belum verified (ID: {result['phish_id']})"
            print(f"⚠️  PhishTank: URL ada di database tapi belum verified")
            
    except requests.exceptions.Timeout:
        result["reason"] = "PhishTank timeout"
        print("⚠️  PhishTank: Timeout")
    except requests.exceptions.RequestException as e:
        result["reason"] = f"PhishTank error: {str(e)}"
        print(f"❌ PhishTank error: {e}")
    except Exception as e:
        result["reason"] = f"PhishTank unexpected error: {str(e)}"
        print(f"❌ PhishTank unexpected error: {e}")
    
    return result


# Test function (untuk debugging)
if __name__ == "__main__":
    # Test dengan URL phishing
    test_url = "http://testsafebrowsing.appspot.com/s/phishing.html"
    print(f"\nTesting PhishTank dengan URL: {test_url}\n")
    
    result = check_phishtank(test_url)
    
    print(f"\nResult:")
    print(f"  Malicious: {result['malicious']}")
    print(f"  Score: {result['score']}")
    print(f"  In Database: {result['in_database']}")
    print(f"  Verified: {result['verified']}")
    print(f"  Reason: {result['reason']}")