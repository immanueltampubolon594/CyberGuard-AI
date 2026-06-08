import requests
import base64

def check_virustotal(url: str, api_key: str) -> dict:
    """Cek URL terhadap VirusTotal API"""
    if not api_key:
        return {"error": "API Key missing", "malicious": 0, "suspicious": 0, "score": 0}

    try:
        encoded_url = base64.urlsafe_b64encode(url.encode('utf-8')).decode().strip("=")
        endpoint = f"https://www.virustotal.com/api/v3/urls/{encoded_url}"
        headers = {"x-apikey": api_key.strip()}
        
        response = requests.get(endpoint, headers=headers, timeout=10)
        
        if response.status_code == 404:
            return {"malicious": 0, "suspicious": 0, "score": 0, "note": "Not found in VT"}
            
        if response.status_code != 200:
            return {"error": f"VT HTTP {response.status_code}", "malicious": 0, "suspicious": 0, "score": 0}

        data = response.json()
        stats = data.get("data", {}).get("attributes", {}).get("last_analysis_stats", {})
        malicious = stats.get("malicious", 0)
        suspicious = stats.get("suspicious", 0)
        
        return {
            "malicious": malicious,
            "suspicious": suspicious,
            "score": min(malicious * 10 + suspicious * 5, 100)
        }
    except Exception as e:
        return {"error": str(e), "malicious": 0, "suspicious": 0, "score": 0}