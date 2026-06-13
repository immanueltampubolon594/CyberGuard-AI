from urllib.parse import urlparse

# ============================================
# TRUSTED DOMAIN WHITELIST
# ============================================
TRUSTED_DOMAINS = [
    # Tech Giants
    "google.com", "google.co.id", "youtube.com", "gmail.com",
    "facebook.com", "instagram.com", "twitter.com", "x.com",
    "github.com", "stackoverflow.com", "gitlab.com",
    "microsoft.com", "apple.com", "amazon.com",
    "cloudflare.com", "netflix.com", "spotify.com",

    # AI & Machine Learning
    "claude.ai", "chatgpt.com", "openai.com", "anthropic.com",
    "bard.google.com", "gemini.google.com", "copilot.microsoft.com",
    "midjourney.com", "stability.ai", "huggingface.co", "replicate.com",

    # Crypto/Web3 (Hati-hati, tapi yang resmi aman)
    "coinbase.com", "binance.com", "metamask.io", "opensea.io",

    # Developer Platforms
    "vercel.app", "netlify.app", "herokuapp.com", "replit.com",
    "codesandbox.io", "glitch.com", "railway.app", "render.com",

    # Cloud & Hosting
    "aws.amazon.com", "cloud.google.com", "azure.microsoft.com",
    "digitalocean.com", "linode.com", "vultr.com", "cloudflare.com",

    # Modern SaaS
    "notion.so", "figma.com", "canva.com", "miro.com", "slack.com",
    "discord.com", "zoom.us", "teams.microsoft.com",

    # Payment (Legal)
    "stripe.com", "paypal.com", "gopay.co.id", "ovo.id", "dana.id",
    
    # E-Commerce Terpercaya
    "tokopedia.com", "shopee.co.id", "bukalapak.com",
    "blibli.com", "lazada.co.id",
    
    # Banking Indonesia
    "bca.co.id", "mandiri.co.id", "bri.co.id", "bni.co.id",
    "danamon.co.id", "cimbniaga.co.id",
    
    # E-Wallet
    "dana.id", "ovo.id", "gopay.co.id", "linkaja.id",
    
    # Courier
    "jne.co.id", "jntexpress.co.id", "sicepat.com", "posindonesia.co.id",
    
    # Ride Hailing
    "grab.com", "gojek.com",
    
    # Government
    "go.id", "kemkes.go.id", "pajak.go.id",
    
    # Education (suffix)
    ".ac.id",   # Semua kampus Indonesia
    ".sch.id",  # Sekolah Indonesia
    ".or.id",   # Organisasi Indonesia
    ".go.id",   # Government Indonesia
    ".co.id",   # Commercial Indonesia
]


def is_trusted_domain(url: str) -> bool:
    """
    Check apakah domain terpercaya (whitelist)
    Returns: True jika domain terpercaya, False jika tidak
    """
    try:
        domain = urlparse(url).netloc.lower()
        
        # Hapus www. prefix
        if domain.startswith("www."):
            domain = domain[4:]
        
        # Hapus port jika ada
        if ":" in domain:
            domain = domain.split(":")[0]
        
        for trusted in TRUSTED_DOMAINS:
            if trusted.startswith("."):
                # Domain suffix (e.g., .ac.id)
                if domain.endswith(trusted):
                    return True
            else:
                # Exact match atau subdomain
                if domain == trusted or domain.endswith("." + trusted):
                    return True
        
        return False
    except Exception:
        return False


def calculate_risk(results: dict, url: str = "") -> dict:
    """
    Kalkulator skor risiko final dengan weighted scoring
    """
    # ============================================
    # INISIALISASI VARIABLE
    # ============================================
    total_score = 0
    reasons = []
    level = "AMAN"
    
    # ============================================
    # CHECK TRUSTED DOMAIN (BYPASS SEMUA CHECK)
    # ============================================
    if url and is_trusted_domain(url):
        return {
            "score": 0,
            "level": "AMAN",
            "reasons": [
                f"Domain terpercaya: {urlparse(url).netloc}",
                "Website terverifikasi dan aman"
            ],
            "summary": "URL ini adalah website terpercaya yang sudah terverifikasi.",
            "recommendation": "URL ini aman untuk dikunjungi. Tetap waspada terhadap link palsu yang meniru website ini.",
            "is_valid_url": True,
            "screenshot": results.get("screenshot"),
            "is_trusted": True
        }
    
    # ============================================
    # 1. HEURISTIC ANALYSIS (Max: 60 poin)
    # ============================================
    if "heuristic" in results:
        heuristic = results["heuristic"]
        h_score = heuristic.get("score", 0)
        h_reasons = heuristic.get("reasons", [])
        
        if h_score > 0:
            total_score += min(h_score, 60)  # Cap di 60
            reasons.extend(h_reasons)
    
    # ============================================
    # 2. GOOGLE SAFE BROWSING (Max: 40 poin)
    # ============================================
    if "google" in results:
        google = results["google"]
        
        if google.get("malicious"):
            total_score += 40
            reasons.append("Google Safe Browsing mendeteksi ancaman")
    
    # ============================================
    # 3. VIRUSTOTAL (Max: 40 poin)
    # ============================================
    if "virustotal" in results:
        vt = results["virustotal"]
        malicious = vt.get("malicious", 0)
        
        if malicious > 0:
            vt_score = min(malicious * 2, 40)
            total_score += vt_score
            reasons.append(f"VirusTotal: {malicious} engine mendeteksi ancaman")

    # ============================================
    # 3.5 PHISHTANK (Max: 100 poin - HIGH PRIORITY!)
    # ============================================
    if "phishtank" in results:
        pt = results["phishtank"]
        
        if pt.get("verified"):
            # Verified phishing = SCORE MAKSIMUM!
            total_score = 100
            reasons.append(f"PhishTank: CONFIRMED phishing (ID: {pt.get('phish_id')})")
            if pt.get("target"):
                reasons.append(f" Target: {pt.get('target')}")
        elif pt.get("in_database"):
            # Ada di database tapi belum verified
            total_score += 50
            reasons.append(f"PhishTank: URL ada di database phishing (belum verified)")
            
    # ============================================
    # 4. URLHAUS (Max: 40 poin)
    # ============================================
    if "urlhaus" in results:
        urlhaus = results["urlhaus"]
        
        if urlhaus.get("malicious"):
            total_score += 40
            reasons.append("URLHaus: URL terdeteksi sebagai malware")
    
    # ============================================
    # 5. URLSCAN (Max: 60 poin)
    # ============================================
    if "urlscan" in results:
        urlscan = results["urlscan"]
        
        if urlscan.get("malicious"):
            total_score += 60
            reasons.append("URLScan: Analisis behavioral mencurigakan")
    
    # ============================================
    # 6. ABUSEIPDB (Max: 20 poin)
    # ============================================
    if "abuseipdb" in results:
        abuseipdb = results["abuseipdb"]
        
        if abuseipdb.get("malicious"):
            total_score += 20
            reasons.append("AbuseIPDB: IP memiliki reputasi buruk")
    
    # ============================================
    # 7. WHOIS - DOMAIN AGE (Max: 20 poin)
    # ============================================
    if "whois" in results:
        whois = results["whois"]
        age_days = whois.get("age_days")
        
        if age_days is not None:
            if age_days < 1:
                total_score += 20
                reasons.append(f"Domain sangat baru ({age_days} hari)")
            elif age_days < 7:
                total_score += 15
                reasons.append(f"Domain baru ({age_days} hari)")
            elif age_days < 30:
                total_score += 10
                reasons.append(f"Domain relatif baru ({age_days} hari)")
    
    # ============================================
    # 8. SSL CERTIFICATE ANALYSIS (IMPROVED!)
    # ============================================
    if "ssl" in results:
        ssl = results["ssl"]
        ssl_score = ssl.get("score", 0)
        
        if not ssl.get("has_ssl"):
            total_score += 40
            reasons.append("Website tidak menggunakan HTTPS (data tidak terenkripsi)")
            
        elif ssl.get("is_self_signed"):
            total_score += 80
            reasons.append("SSL Certificate self-signed (sangat berbahaya - ciri khas phishing)")
            
        elif ssl.get("is_expired", False):
            total_score += 50
            reasons.append("SSL Certificate sudah expired")
            
        elif ssl.get("is_domain_mismatch", False):
            total_score += 70
            reasons.append("SSL Certificate tidak match dengan domain (phishing indicator)")
            
        elif ssl.get("days_until_expiry") is not None:
            days_left = ssl.get("days_until_expiry")
            if days_left < 7:
                total_score += 30
                reasons.append(f"SSL akan expired dalam {days_left} hari")
            elif days_left < 30:
                total_score += 15
                reasons.append(f"SSL akan expired dalam {days_left} hari")
        
        elif ssl.get("is_trusted_issuer"):
            pass  # 0 poin, website legal tetap aman
            
        elif ssl.get("is_ev_ssl"):
            total_score = max(0, total_score - 10)
            reasons.append("SSL Extended Validation (sangat terpercaya)")
            
        elif ssl.get("is_lets_encrypt"):
            total_score += 5
            reasons.append("SSL gratis Let's Encrypt (umum digunakan)")
            
        elif ssl.get("issuer") == "Unknown":
            total_score += 25
            reasons.append("SSL issuer tidak dikenal")
            
        elif ssl_score > 0:
            total_score += ssl_score
            reasons.extend(ssl.get("reasons", []))
    
    # ============================================
    # 9. URL EXPANSION (Max: 35 poin)
    # ============================================
    if "url_expansion" in results:
        expansion = results["url_expansion"]
        
        if expansion.get("is_shortened"):
            total_score += 15
            reasons.append("URL shortener terdeteksi (menyembunyikan URL asli)")
            
            hops = expansion.get("hops", 0)
            if hops > 2:
                total_score += 20
                reasons.append(f"Banyak redirect ({hops} hops) - teknik cloaking")
            elif hops > 0:
                total_score += 10
                reasons.append(f"Redirect ({hops} hop)")
            
            original = expansion.get("original", "")
            expanded = expansion.get("expanded", "")
            
            if original != expanded:
                try:
                    original_domain = urlparse(original).netloc
                    expanded_domain = urlparse(expanded).netloc
                    
                    if original_domain != expanded_domain:
                        total_score += 10
                        reasons.append("Redirect ke domain berbeda")
                except:
                    pass
    
    # ============================================
    # 10. URL VALIDATION (Max: 30 poin)
    # ============================================
    if "url_validation" in results:
        validation = results["url_validation"]
        
        if validation.get("is_random_looking"):
            total_score += 15
            reasons.append("Domain terlihat random (kemungkinan typo/phishing)")
        
        if not validation.get("dns_resolves"):
            total_score += 30
            reasons.append("DNS tidak resolve (domain tidak aktif)")

    # ============================================
    # 11. CONTENT ANALYZER (Deteksi Piracy & Judi) - FIXED INDENTATION!
    # ============================================
    if "content_analyzer" in results:
        ca = results["content_analyzer"]
        if not ca.get("skipped") and ca.get("malicious"):
            total_score += 40
            reasons.extend(ca.get("reasons", []))
    
    # ============================================
    # CAP SCORE DI 100
    # ============================================
    total_score = min(total_score, 100)
    
    # ============================================
    # TENTUKAN LEVEL
    # ============================================
    if total_score >= 75:
        level = "BERBAHAYA"
    elif total_score >= 40:
        level = "MENCURIGAKAN"
    elif total_score >= 25:
        level = "WASPADA"
    else:
        level = "AMAN"
    
    # ============================================
    # BUAT SUMMARY & RECOMMENDATION
    # ============================================
    if level == "BERBAHAYA":
        summary = "URL ini TERKONFIRMASI berbahaya oleh database keamanan global. JANGAN kunjungi URL ini!"
        recommendation = "JANGAN masukkan data pribadi, password, atau informasi kartu kredit. Tutup halaman ini segera."
    elif level == "MENCURIGAKAN":
        summary = "URL ini menunjukkan beberapa indikator mencurigakan yang kuat. Sangat disarankan untuk tidak mengunjungi."
        recommendation = "Hindari memasukkan data sensitif. Jika ragu, verifikasi melalui saluran resmi."
    elif level == "WASPADA":
        summary = "URL ini memiliki beberapa karakteristik yang perlu diperhatikan. Harap berhati-hati."
        recommendation = "Periksa URL dengan teliti. Pastikan Anda mengunjungi website resmi."
    else:
        summary = "URL ini tidak menunjukkan ancaman yang signifikan berdasarkan analisis kami."
        recommendation = "URL ini tampak aman, namun tetap waspada dan jangan berikan informasi sensitif sembarangan."
    
    # ============================================
    # RETURN FINAL RESULT
    # ============================================
    return {
        "score": total_score,
        "level": level,
        "reasons": reasons,
        "summary": summary,
        "recommendation": recommendation,
        "is_valid_url": True,
        "screenshot": results.get("screenshot"),
        "is_trusted": False
    }