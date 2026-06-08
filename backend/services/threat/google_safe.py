import requests

def check_google_safe(url: str, api_key: str) -> dict:
    if not api_key:
        return {"error": "API Key missing", "malicious": False, "score": 0}

    endpoint = f"https://safebrowsing.googleapis.com/v4/threatMatches:find?key={api_key.strip()}"
    
    payload = {
        "client": {"clientId": "cyberguard-ai", "clientVersion": "1.0.0"},
        "threatInfo": {
            "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
            "platformTypes": ["ANY_PLATFORM"],
            "threatEntryTypes": ["URL"],
            "threatEntries": [{"url": url}]
        }
    }

    try:
        response = requests.post(endpoint, json=payload, timeout=10)
        
        if response.status_code != 200:
            return {"error": f"GSB HTTP {response.status_code}", "malicious": False, "score": 0}
            
        data = response.json()
        
        # FIX UTAMA: Google menggunakan key "matches", BUKAN "threatMatches"
        malicious = "matches" in data and len(data["matches"]) > 0
        
        return {
            "malicious": malicious,
            "score": 100 if malicious else 0
        }
    except Exception as e:
        return {"error": str(e), "malicious": False, "score": 0}