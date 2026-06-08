import requests

URLHAUS_ENDPOINT = "https://urlhaus-api.abuse.ch/v1/url/"

def check_urlhaus(url: str) -> dict:
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "application/json"
        }
        
        # FIX UTAMA: Hapus spasi pada "url"
        response = requests.post(
            URLHAUS_ENDPOINT,
            data={"url": url}, 
            headers=headers,
            timeout=10
        )

        if response.status_code != 200:
            return {"error": f"URLHaus HTTP {response.status_code}", "malicious": False, "score": 0}

        data = response.json()
        query_status = data.get("query_status")

        if query_status == "ok":
            return {"malicious": True, "score": 100, "source": "urlhaus"}
        
        if query_status == "no_results":
            return {"malicious": False, "score": 0, "source": "urlhaus"}

        return {"error": f"Unknown status: {query_status}", "malicious": False, "score": 0}

    except Exception as e:
        return {"error": str(e), "malicious": False, "score": 0}