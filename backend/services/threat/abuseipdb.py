import requests

def check_ip(ip: str, api_key: str) -> dict:
    """Cek IP terhadap AbuseIPDB"""
    if not api_key:
        return {"error": "API Key missing", "score": 0, "malicious": False}

    endpoint = "https://api.abuseipdb.com/api/v2/check"
    headers = {
        "Key": api_key.strip(),
        "Accept": "application/json"
    }
    params = {
        "ipAddress": ip,
        "maxAgeInDays": 90
    }

    try:
        response = requests.get(endpoint, headers=headers, params=params, timeout=10)
        
        if response.status_code != 200:
            return {"error": f"AbuseIPDB HTTP {response.status_code}", "score": 0, "malicious": False}

        data = response.json()
        abuse_score = data.get("data", {}).get("abuseConfidenceScore", 0)
        
        return {
            "score": abuse_score,
            "malicious": abuse_score > 50,
            "ip": ip
        }
    except Exception as e:
        return {"error": str(e), "score": 0, "malicious": False}