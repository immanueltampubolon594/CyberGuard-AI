import requests
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GOOGLE_SAFE_BROWSING_KEY")
print(f"🔑 API Key: {API_KEY[:10]}...")  # Show first 10 chars

if not API_KEY or len(API_KEY) < 30:
    print("❌ API Key tidak valid atau terlalu pendek!")
    exit()

endpoint = f"https://safebrowsing.googleapis.com/v4/threatMatches:find?key={API_KEY}"

payload = {
    "client": {
        "clientId": "cyberguard-test",
        "clientVersion": "1.0.0"
    },
    "threatInfo": {
        "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING"],
        "platformTypes": ["ANY_PLATFORM"],
        "threatEntryTypes": ["URL"],
        "threatEntries": [
            {"url": "http://testsafebrowsing.appspot.com/"}
        ]
    }
}

try:
    response = requests.post(endpoint, json=payload)
    print(f"\n📡 Status Code: {response.status_code}")
    print(f"\n📦 Response:")
    print(response.json())
    
    if response.status_code == 200:
        print("\n✅ API Key BERFUNGSI!")
    else:
        print(f"\n❌ API Key GAGAL: {response.json()}")
        
except Exception as e:
    print(f"\n❌ Error: {e}")