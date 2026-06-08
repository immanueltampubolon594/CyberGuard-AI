import requests
import tldextract
from datetime import datetime, timezone
from dateutil import parser as date_parser

def check_whois(url: str, api_key: str) -> dict:
    """Cek WHOIS untuk usia domain"""
    try:
        extracted = tldextract.extract(url)
        domain = f"{extracted.domain}.{extracted.suffix}"
        
        endpoint = "https://www.whoisxmlapi.com/whoisserver/WhoisService"
        params = {
            "apiKey": api_key.strip(),
            "domainName": domain,
            "outputFormat": "JSON",
            "ignoreRawTexts": "1"
        }

        response = requests.get(endpoint, params=params, timeout=10)
        
        if response.status_code != 200:
            return {"error": f"WHOIS HTTP {response.status_code}", "domain": domain, "age_days": None}

        data = response.json()
        whois_record = data.get("WhoisRecord", {})
        created_date = whois_record.get("createdDate")
        
        age_days = None
        if created_date:
            try:
                created_dt = date_parser.parse(created_date)
                if created_dt.tzinfo is None:
                    created_dt = created_dt.replace(tzinfo=timezone.utc)
                now = datetime.now(timezone.utc)
                age_days = (now - created_dt).days
            except Exception as e:
                print(f"Error parsing date: {e}")
        
        return {
            "domain": domain,
            "age_days": age_days,
            "registrar": whois_record.get("registrarName")
        }

    except Exception as e:
        return {"error": str(e), "domain": "unknown", "age_days": None}