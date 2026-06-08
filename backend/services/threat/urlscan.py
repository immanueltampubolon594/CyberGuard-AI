import requests
import time
from urllib.parse import urlparse

def check_urlscan(url: str, api_key: str) -> dict:
    """Cek URL menggunakan URLScan API"""
    if not api_key:
        return {"error": "API Key missing", "malicious": False, "score": 0}

    try:
        parsed = urlparse(url)
        domain = parsed.netloc

        search_endpoint = f"https://urlscan.io/api/v1/search/?q=domain:{domain}"
        headers = {"API-Key": api_key.strip()}

        search_resp = requests.get(search_endpoint, headers=headers, timeout=10)
        
        if search_resp.status_code == 200:
            search_data = search_resp.json()
            total = search_data.get("total", 0)
            print(f"URLScan: Found {total} cached scans")

            if total > 0:
                results = search_data.get("results", [])
                if len(results) > 0:
                    first_result = results[0]
                    verdicts = first_result.get("verdicts", {})
                    overall = verdicts.get("overall", {})
                    malicious = overall.get("malicious", False)
                    score = overall.get("score", 100 if malicious else 0)
                    return {"malicious": malicious, "score": score, "cached": True}

        submit_endpoint = "https://urlscan.io/api/v1/scan/"
        payload = {
            "url": url,
            "visibility": "unlisted",
            "tags": ["cyberguard"]
        }

        submit_resp = requests.post(submit_endpoint, headers=headers, json=payload, timeout=10)

        if submit_resp.status_code not in [200, 201]:
            return {"error": f"URLScan Submit Error: {submit_resp.status_code}", "malicious": False, "score": 0}

        submit_data = submit_resp.json()

        if submit_data.get("api"):
            result_url = submit_data["api"]
            for attempt in range(10):
                time.sleep(3)
                result_resp = requests.get(result_url, timeout=10)
                if result_resp.status_code == 200:
                    result_data = result_resp.json()
                    if result_data.get("page") or result_data.get("status") == "finished":
                        verdicts = result_data.get("verdicts", {})
                        overall = verdicts.get("overall", {})
                        malicious = overall.get("malicious", False)
                        score = overall.get("score", 100 if malicious else 0)
                        return {"malicious": malicious, "score": score, "cached": False}
            
            return {"error": "URLScan timeout", "malicious": False, "score": 0}

        return {"malicious": False, "score": 0}

    except Exception as e:
        return {"error": str(e), "malicious": False, "score": 0}