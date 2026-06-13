import requests
import re
from urllib.parse import urlparse

# ============================================
# WHITELIST DOMAIN RESMI (ANTI FALSE POSITIVE)
# ============================================
OFFICIAL_DOMAINS = [
    # Game Platforms (Legal)
    "steampowered.com", "steamcommunity.com", "epicgames.com",
    "garena.co.id", "garena.com", "origin.com", "ea.com",
    "ubisoft.com", "blizzard.com", "battle.net", "playstation.com",
    "xbox.com", "nintendo.com", "riotgames.com", "leagueoflegends.com",
    "valorant.net", "minecraft.net", "roblox.com", "fortnite.com",
    
    # Streaming (Legal)
    "netflix.com", "spotify.com", "disneyplus.com", "hbo.com",
    "primevideo.com", "youtube.com", "twitch.tv",
    
    # E-Commerce (Legal)
    "tokopedia.com", "shopee.co.id", "bukalapak.com", "blibli.com",
    "lazada.co.id", "amazon.com", "ebay.com", "alibaba.com",
    
    # Payment (Legal)
    "paypal.com", "stripe.com", "midtrans.com", "xendit.co",
    
    # Social Media (Legal)
    "facebook.com", "instagram.com", "twitter.com", "x.com",
    "tiktok.com", "linkedin.com", "whatsapp.com", "telegram.org",
]


def is_official_domain(url: str) -> bool:
    """Cek apakah domain resmi (legal)"""
    try:
        domain = urlparse(url).netloc.lower()
        if domain.startswith("www."):
            domain = domain[4:]
        
        for official in OFFICIAL_DOMAINS:
            if domain == official or domain.endswith("." + official):
                return True
        return False
    except:
        return False


def analyze_content(url: str) -> dict:
    """
    Advanced Content Analyzer - Membaca isi website untuk deteksi konten ilegal.
    Menggunakan teknik Fingerprinting (kombinasi pola) untuk akurasi tinggi.
    """
    result = {
        "malicious": False,
        "score": 0,
        "category": "Clean",
        "reasons": [],
        "source": "Content Analyzer",
        "confidence": "low"
    }
    
    # ==========================================
    # EARLY EXIT: Domain Resmi = SKIP ANALYSIS
    # ==========================================
    if is_official_domain(url):
        result["category"] = "Official/Legal"
        result["reasons"].append("Domain resmi terpercaya (skip content analysis)")
        return result
    
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
        }
        
        # Fetch HTML website
        response = requests.get(url, headers=headers, timeout=8, allow_redirects=True)
        
        if response.status_code != 200:
            return result
        
        # Prepare text
        content = response.text.lower()
        text_only = re.sub(r'<[^>]+>', ' ', content)
        # Normalize whitespace
        text_only = re.sub(r'\s+', ' ', text_only)
        
        score = 0
        reasons = []
        category = "Clean"
        confidence_hits = 0
        
        # ==========================================
        # 1. DETEKSI JUDI ONLINE (GLOBAL + INDONESIA)
        # ==========================================
        gambling_fingerprints = {
            # High Confidence - Pola Khas Judi Indonesia
            "selamat_bersenang": (r'selamat\s+bersenang', 30, "Slogan khas situs judi"),
            "app_download_qr": (r'(app|apk)\s+download.*(?:android|ios|qr)', 35, "Pola download APK judi"),
            "scan_qr_download": (r'scan\s+qr\s+code.*download', 30, "QR Code download pattern"),
            "versi_web_android": (r'versi\s+web.*android', 25, "Web + Android app pattern"),
            "lele_brand": (r'lele\d{2,4}', 40, "Brand judi LELE (lele189, lele303)"),
            "slot_gacor": (r'slot\s+gacor', 35, "Keyword slot gacor"),
            "rtp_live": (r'rtp\s+(live|hari\s+ini)', 30, "RTP live pattern"),
            "maxwin": (r'maxwin|x500|x1000', 30, "Keyword maxwin"),
            "deposit_pulsa": (r'deposit\s*(via|pakai)?\s*(pulsa|dana|ovo|gopay|bank)', 35, "Transaksi judi lokal"),
            "withdraw_judi": (r'withdraw(al)?\s*(dana|ovo|bank|cepat)', 30, "Withdrawal pattern"),
            
            # Medium Confidence - Judi Global
            "casino_online": (r'(online\s+)?casino\s*(games?|slots?)', 25, "Casino online"),
            "sportsbook": (r'sportsbook|sbobet|saba\s*sports', 30, "Sports betting"),
            "poker_online": (r'poker\s*(online|indonesia)', 25, "Poker online"),
            "togel_hongkong": (r'togel\s*(hongkong|singapore|sydney)', 30, "Togel online"),
            "jackpot_progressive": (r'progressive\s+jackpot|mega\s+jackpot', 20, "Jackpot pattern"),
            
            # Provider Judi (Known Bad Actors)
            "pragmatic_play": (r'pragmatic\s*play', 25, "Provider slot Pragmatic"),
            "pg_soft": (r'pg\s*soft|pg\s*slot', 25, "Provider PG Soft"),
            "habanero": (r'habanero\s*slots?', 20, "Provider Habanero"),
            "microgaming": (r'microgaming', 20, "Provider Microgaming"),
        }
        
        gambling_hits = 0
        for key, (pattern, points, reason) in gambling_fingerprints.items():
            if re.search(pattern, text_only, re.IGNORECASE):
                gambling_hits += 1
                score += points
                if reason not in reasons:
                    reasons.append(f"{reason}")
        
        if gambling_hits >= 2:
            category = "Gambling"
            confidence_hits += 2
        
        # ==========================================
        # 2. DETEKSI PIRACY / FILE HOSTING BAJAKAN
        # ==========================================
        piracy_fingerprints = {
            # High Confidence - Pola Khas Pembajakan
            "premium_plans": (r'premium\s+(plans?|traffic|account|membership)', 30, "Premium plans pattern"),
            "payment_pattern": (r'\$\d+\.?\d*\s*(per|\/|\s+days?|pay\s+now)', 25, "Pola pembayaran bajakan"),
            "pay_now": (r'pay\s+now', 20, "Tombol pembayaran instan"),
            "download_rar": (r'download.*\.(rar|zip|7z|iso)', 25, "Download file arsip"),
            "part_archive": (r'\.part\d+\.(rar|zip)', 30, "Multi-part archive (khas bajakan)"),
            "crack_tools": (r'(crack|repack|keygen|activator|patcher)', 35, "Tools ilegal"),
            "full_version": (r'full\s+version\s+(free|download)', 30, "Full version gratis"),
            "bandwidth_pattern": (r'(100|500|1000|2000)\s*gb', 25, "Pola kuota bandwidth"),
            
            # Known Piracy Brands (Sangat Akurat)
            "fitgirl": (r'fitgirl[-\s]?repacks?', 40, "FitGirl Repacks (situs bajakan)"),
            "dodi": (r'dodi[-\s]?repacks?', 40, "DODI Repacks"),
            "skidrow": (r'skidrow|reloaded|codex|empress', 35, "Group cracker terkenal"),
            "apunkagames": (r'apunkagames', 40, "ApunKaGames (situs bajakan)"),
            "igg_games": (r'igg[-\s]?games', 35, "IGG Games"),
            "ocean_of_games": (r'ocean\s+of\s+games', 35, "Ocean of Games"),
            
            # Game Titles yang Sering Dibajak (AAA Games)
            "aaa_games": (r'(elden\s+ring|cyberpunk\s*2077|gta\s*[v6]|red\s+dead\s+redemption|god\s+of\s+war|horizon\s+zero\s+dawn)\s*(free|download|crack|repack)', 30, "AAA game bajakan"),
        }
        
        piracy_hits = 0
        for key, (pattern, points, reason) in piracy_fingerprints.items():
            if re.search(pattern, text_only, re.IGNORECASE):
                piracy_hits += 1
                score += points
                if reason not in reasons:
                    reasons.append(f"{reason}")
        
        # Cek URL untuk known piracy domains
        url_lower = url.lower()
        if any(x in url_lower for x in ["fitgirl", "repacks", "apunkagames", "igg-games"]):
            score += 30
            reasons.append("URL mengandung situs bajakan terkenal")
            piracy_hits += 1
            
        if piracy_hits >= 2:
            category = "Piracy / Warez"
            confidence_hits += 2
        
        # ==========================================
        # 3. DETEKSI KONTEN DEWASA / PORNOGRAFI
        # ==========================================
        adult_fingerprints = {
            # High Confidence
            "xxx_content": (r'\b(xxx|porn|porno|sex\s+video)\b', 40, "Konten eksplisit"),
            "adult_site": (r'adult\s+(site|content|video|chat)', 35, "Situs dewasa"),
            "onlyfans_pattern": (r'(onlyfans|fansly|patreon\s+adult)', 30, "Platform konten dewasa"),
            "cam_model": (r'(live\s+cam|cam\s+girl|cam\s+model)', 35, "Cam model"),
            "hentai": (r'\bhentai\b', 30, "Konten hentai"),
            
            # Medium Confidence
            "nsfw_warning": (r'nsfw|18\+\s+only|adult\s+only', 25, "Warning konten dewasa"),
            "dating_adult": (r'(hookup|adult\s+dating|casual\s+sex)', 30, "Dating dewasa"),
        }
        
        adult_hits = 0
        for key, (pattern, points, reason) in adult_fingerprints.items():
            if re.search(pattern, text_only, re.IGNORECASE):
                adult_hits += 1
                score += points
                if reason not in reasons:
                    reasons.append(f"{reason}")
        
        if adult_hits >= 2:
            category = "Adult / Pornography"
            confidence_hits += 2
        
        # ==========================================
        # 4. DETEKSI MALWARE DISTRIBUTION
        # ==========================================
        malware_fingerprints = {
            # Pola Download Mencurigakan
            "free_download_exe": (r'free\s+download.*\.(exe|msi|bat|cmd)', 35, "Download executable gratis"),
            "crack_exe": (r'(crack|keygen|patch).*\.(exe|zip|rar)', 40, "Crack/Keygen executable"),
            "activator": (r'(windows|office)\s+activator', 40, "Activator ilegal"),
            
            # Peringatan Browser
            "browser_warning": (r'(your\s+computer|system)\s+(is\s+)?(infected|has\s+virus)', 45, "Fake virus warning"),
            "call_support": (r'call\s+(microsoft|apple|windows)\s+support', 40, "Tech support scam"),
            
            # Pola Drive-by Download
            "auto_download": (r'(click\s+here|download\s+now)\s+to\s+(fix|clean|protect)', 35, "Pola drive-by download"),
        }
        
        malware_hits = 0
        for key, (pattern, points, reason) in malware_fingerprints.items():
            if re.search(pattern, text_only, re.IGNORECASE):
                malware_hits += 1
                score += points
                if reason not in reasons:
                    reasons.append(f"{reason}")
        
        if malware_hits >= 1:
            category = "Malware Distribution"
            confidence_hits += 2
        
        # ==========================================
        # 5. DETEKSI SCAM / PHISHING
        # ==========================================
        scam_fingerprints = {
            # Phishing Patterns
            "verify_account": (r'verify\s+(your|my)\s+account', 30, "Phishing verification"),
            "account_suspended": (r'account\s+(suspended|locked|limited|blocked)', 30, "Account threat"),
            "urgent_action": (r'(urgent|immediate|action\s+required)', 20, "Urgency pattern"),
            
            # Scam Hadiah
            "you_won": (r'(congratulations|you\s+(won|have\s+won)|prize)', 30, "Scam hadiah"),
            "claim_now": (r'claim\s+(your\s+)?(now|prize|reward)', 25, "Claim pattern"),
            "lottery_win": (r'(lottery|sweepstakes)\s+(winner|won)', 35, "Scam lotere"),
            
            # Investment Scam
            "crypto_scam": (r'(bitcoin|crypto)\s+(investment|trading)\s+(guaranteed|profit)', 35, "Scam investasi crypto"),
            "get_rich": (r'(get\s+rich|make\s+money)\s+(fast|quick|easy)', 30, "Scam cepat kaya"),
        }
        
        scam_hits = 0
        for key, (pattern, points, reason) in scam_fingerprints.items():
            if re.search(pattern, text_only, re.IGNORECASE):
                scam_hits += 1
                score += points
                if reason not in reasons:
                    reasons.append(f"{reason}")
        
        if scam_hits >= 2:
            category = "Scam / Phishing"
            confidence_hits += 2
        
        # ==========================================
        # 6. DETEKSI MARKETPLACE ILEGAL
        # ==========================================
        illegal_fingerprints = {
            "drugs": (r'(buy\s+cocaine|buy\s+heroin|order\s+drugs|dark\s+market)', 40, "Pasar narkoba"),
            "weapons": (r'(buy\s+guns|buy\s+weapons|order\s+firearms)', 40, "Pasar senjata"),
            "cards": (r'(buy\s+cc|cvv\s+dumps|credit\s+card\s+dumps)', 45, "Pasar kartu kredit curian"),
            "hacking_services": (r'(hire\s+hacker|ddos\s+for\s+hire|hack\s+account)', 40, "Jasa hacking"),
        }
        
        for key, (pattern, points, reason) in illegal_fingerprints.items():
            if re.search(pattern, text_only, re.IGNORECASE):
                score += points
                reasons.append(f"{reason}")
                category = "Illegal Marketplace"
                confidence_hits += 2
        
        # ==========================================
        # FINALISASI SKOR & KEPUTUSAN
        # ==========================================
        result["score"] = min(score, 100)
        
        # Tentukan confidence level
        if confidence_hits >= 3:
            result["confidence"] = "high"
            result["malicious"] = True
        elif confidence_hits >= 2:
            result["confidence"] = "medium"
            result["malicious"] = result["score"] >= 50
        else:
            result["confidence"] = "low"
            result["malicious"] = result["score"] >= 60  # Butuh skor lebih tinggi untuk low confidence
        
        result["category"] = category if category != "Clean" else "Clean"
        result["reasons"] = reasons[:5]  # Max 5 alasan
        
    except requests.exceptions.Timeout:
        result["reasons"].append("Website timeout (tidak bisa dibaca)")
    except requests.exceptions.ConnectionError:
        result["reasons"].append("Koneksi gagal (situs mungkin down)")
    except Exception as e:
        result["reasons"].append(f"Error: {str(e)[:30]}")
    
    return result