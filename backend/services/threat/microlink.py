import requests
from urllib.parse import quote

def capture_screenshot(url: str) -> str | None:
    """
    Ambil screenshot menggunakan Microlink.io (GRATIS - tanpa API key)
    """
    try:
        # Encode URL dengan benar
        encoded_url = quote(url, safe=':/')  # Tambah : dan / agar URL tetap valid
        
        # Gunakan endpoint yang lebih sederhana
        api_url = f"https://api.microlink.io/?url={encoded_url}&screenshot=true"
        
        print(f"   📸 Request ke: {api_url[:80]}...")
        
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
        
        response = requests.get(api_url, headers=headers, timeout=25)
        
        print(f"   📊 Response status: {response.status_code}")
        print(f"   📊 Response length: {len(response.text)} bytes")
        
        # Debug: lihat response pertama
        if response.status_code != 200:
            print(f"   ❌ HTTP Error: {response.status_code}")
            print(f"   ❌ Response: {response.text[:200]}")
            return None
        
        # Coba parse JSON
        try:
            data = response.json()
        except requests.exceptions.JSONDecodeError as e:
            print(f"   ❌ JSON decode error: {e}")
            print(f"   ❌ Response text: {response.text[:300]}")
            return None
        
        # Cek status
        if data.get("status") == "success":
            screenshot_data = data.get("data", {}).get("screenshot", {})
            screenshot_url = screenshot_data.get("url")
            
            if screenshot_url:
                print(f"   ✅ Screenshot berhasil!")
                print(f"   📸 URL: {screenshot_url[:100]}...")
                return screenshot_url
            else:
                print("   ⚠️ Tidak ada URL screenshot di response")
                print(f"   📦 Full response: {data}")
                return None
        else:
            print(f"   ⚠️ API status: {data.get('status')}")
            print(f"   ⚠️ Message: {data.get('message', 'N/A')}")
            return None
    
    except requests.exceptions.Timeout:
        print("   ⚠️ Request timeout (25 detik)")
        return None
    except requests.exceptions.RequestException as e:
        print(f"   ⚠️ Request error: {e}")
        return None
    except Exception as e:
        print(f"   ⚠️ Unexpected error: {e}")
        return None