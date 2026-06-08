import requests
from urllib.parse import urlparse

# Daftar URL shortener populer
KNOWN_SHORTENERS = [
    "bit.ly", "tinyurl.com", "t.co", "s.id", "ow.ly",
    "is.gd", "buff.ly", "adf.ly", "bit.do", "shorte.st",
    "dlvr.it", "tiny.cc", "lnkd.in", "youtu.be", "goo.gl",
    "fb.me", "wp.me", "rebrand.ly", "short.io", "cutt.ly",
    "goo.gl", "tr.im", "snip.ly", "clck.ru"
]

def is_shortened_url(url: str) -> bool:
    """Cek apakah URL adalah shortener"""
    domain = urlparse(url).netloc.lower()
    return any(shortener in domain for shortener in KNOWN_SHORTENERS)

def expand_url(url: str) -> dict:
    """
    Expand URL shortener ke URL asli
    Returns: dict dengan original_url, expanded_url, is_shortened
    """
    result = {
        "original_url": url,
        "expanded_url": url,
        "is_shortened": False,
        "redirect_chain": [],
        "final_domain": urlparse(url).netloc
    }
    
    # Cek apakah URL adalah shortener
    if not is_shortened_url(url):
        return result
    
    result["is_shortened"] = True
    
    try:
        # Follow redirects untuk dapat URL final
        response = requests.head(
            url,
            allow_redirects=True,
            timeout=10,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
        )
        
        # Simpan redirect chain
        if response.history:
            result["redirect_chain"] = [resp.url for resp in response.history]
        
        # URL final setelah semua redirect
        result["expanded_url"] = response.url
        result["final_domain"] = urlparse(response.url).netloc
        
        print(f"URL Resolver: {url} → {response.url}")
        
    except requests.exceptions.Timeout:
        print(f"URL Resolver: Timeout untuk {url}")
        result["error"] = "Timeout"
    except requests.exceptions.RequestException as e:
        print(f"URL Resolver: Error untuk {url}: {e}")
        result["error"] = str(e)
    
    return result