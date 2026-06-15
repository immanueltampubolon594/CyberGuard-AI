import tldextract
import Levenshtein
import re
import ipaddress

# ============================================
# WHITELIST DOMAIN TERPERCAYA
# ============================================
TRUSTED_TLDS = {
    "ac.id", "go.id", "sch.id", "or.id", "co.id",
    "edu", "ac.uk", "gov", "gov.uk", "mil",
}

# ============================================
# BRAND YANG SERING DI-IMPERSONATE
# ============================================
BRANDS = [
    "google", "facebook", "paypal", "instagram", "twitter", "linkedin", 
    "microsoft", "apple", "tokopedia", "shopee", "bukalapak", "bca", 
    "mandiri", "bri", "bni", "dana", "ovo", "gopay", "jne", "jnt", 
    "sicepat", "pos", "grab", "gojek", "tiktok", "fifa", "uefa"
]

# ============================================
# KEYWORD MENCURIGAKAN (PHISHING)
# ============================================
SUSPICIOUS_KEYWORDS = [
    "login", "verify", "secure", "bonus", "gift", "wallet", "banking", 
    "update", "account", "resi", "paket", "tracking", "pembayaran", 
    "tagihan", "klaim", "hadiah", "menang", "konfirmasi", "verifikasi", 
    "kadaluarsa", "diblokir", "suspended"
]

# ============================================
#  KEYWORD JUDI
# ============================================
GAMBLING_KEYWORDS = [
    # Game judi
    "slot", "casino", "poker", "togel", "lotto", "lottery",
    "sportsbook", "sports betting", "taruhan", "judi", "betting",
    "bola", "sbobet", "maxbet", "ibcbet",
    
    # Istilah judi
    "deposit", "withdraw", "withdrawal", "penarikan", "setoran",
    "jackpot", "jp", "scatter", "wild", "spin", "putaran",
    "rtp", "live rtp", "gacor", "maxwin", "x500", "x1000",
    "mahjong", "pg slot", "pragmatic", "habanero",
    
    # Promo judi
    "bonus new member", "bonus deposit", "cashback", "rollingan",
    "vip", "member", "agen", "bandar", "bandarq",
    
    # Game spesifik
    "baccarat", "roulette", "blackjack", "domino", "qq",
    "capsa", "poker online", "sabung ayam", "cockfighting",
    
    # Pattern domain judi
    "game", "play", "win", "bet"
]

# ============================================
# TLD MENCURIGAKAN 
# ============================================
SUSPICIOUS_TLDS = [
    "xyz", "top", "click", "work", "gq", "ml", "cf", "tk", "ga", 
    "buzz", "rest", "cam", "live", "online", "site", "space", 
    "tech", "fun", "bet", "win", "vip", "club"
]

# ============================================
#  PIRACY & FILE HOSTING DETECTION 
# ============================================

# Known piracy/file hosting domains
PIRACY_DOMAINS = [
    "datanodes", "datafilehost", "zippyshare", "mediafire",
    "mega.nz", "rapidgator", "uploaded", "turbobit",
    "fitgirl-repacks", "fitgirl", "dodi-repacks", "elamigos",
    "skidrow", "cpfgames", "ovagames", "gamestorrents",
    "1337x", "thepiratebay", "rarbg", "gog-games",
]

# Game titles (AAA games yang sering di-crack)
PIRACY_GAME_KEYWORDS = [
    "rdr2", "red dead redemption", "red-dead",
    "cyberpunk", "cyberpunk-2077", "gta", "grand theft auto",
    "nba", "pes", "call of duty", "cod",
    "assassin's creed", "batman", "lego batman",
    "witcher", "horizon", "god of war",
    "minecraft", "fortnite", "apex legends",
    "resident evil", "elden ring", "dark souls",
]

# Crack/repack keywords
PIRACY_CRACK_KEYWORDS = [
    "crack", "cracked", "cracking",
    "repack", "repacks", "repacked",
    "setup_files", "setup files",
    "keygen", "patch", "activator", "loader",
    "full version", "unlocked", "premium free",
    "download free", "free download",
]

# Dangerous file extensions
DANGEROUS_EXTENSIONS = [
    ".rar", ".zip", ".7z", ".iso", ".bin",
    ".exe", ".msi", ".bat", ".cmd",
    ".part1", ".part2", ".part3", ".part4",
    ".part01", ".part02", ".part03", ".part04",
]

# TLD yang sering dipakai piracy
PIRACY_TLDS = [
    "to", "cc", "ws", "bz", "ms", "vc",
    "xyz", "top", "click", "work", "gq", "ml", "cf", "tk",
]


# ============================================
# FUNGSI DETEKSI PIRACY 
# ============================================
def detect_piracy_indicators(url: str, full_domain: str) -> tuple:
    """
    Deteksi indikator piracy/crack secara agresif
    
    Args:
        url: URL yang akan dianalisis
        full_domain: Full domain (subdomain + domain + tld)
        
    Returns:
        tuple: (score, reasons)
            - score: int (0-100+)
            - reasons: list of strings
    """
    score = 0
    reasons = []
    url_lower = url.lower()
    full_domain_lower = full_domain.lower()
    
    # 1. Check known piracy domains (HIGH SCORE!)
    for piracy_domain in PIRACY_DOMAINS:
        if piracy_domain in full_domain_lower:
            score += 50
            reasons.append(f"Known piracy host: {piracy_domain}")
            break
    
    # 2. Check game titles
    matched_games = []
    for game in PIRACY_GAME_KEYWORDS:
        if game in url_lower:
            matched_games.append(game)
    
    if matched_games:
        score += 30
        reasons.append(f"Game piracy keyword: {', '.join(matched_games[:3])}")
    
    # 3. Check crack/repack keywords
    matched_crack = []
    for crack in PIRACY_CRACK_KEYWORDS:
        if crack in url_lower:
            matched_crack.append(crack)
    
    if matched_crack:
        score += 25
        reasons.append(f"Crack/repack keyword: {', '.join(matched_crack[:3])}")
    
    # 4. Check dangerous file extensions
    matched_ext = []
    for ext in DANGEROUS_EXTENSIONS:
        if ext in url_lower:
            matched_ext.append(ext)
    
    if matched_ext:
        score += 20
        reasons.append(f"Compressed/installer file: {', '.join(matched_ext[:3])}")
    
    # 5. Check piracy TLD (hindari duplicate dengan SUSPICIOUS_TLDS)
    extracted = tldextract.extract(url)
    if extracted.suffix in PIRACY_TLDS and extracted.suffix not in SUSPICIOUS_TLDS:
        score += 15
        reasons.append(f"TLD .{extracted.suffix} sering dipakai piracy")
    
    # 6. Check random ID pattern (file hosting signature)
    # Pattern: /abc123xyz/filename.ext
    if re.search(r'/[a-z0-9]{8,}/[^/]+\.(rar|zip|iso|exe)', url_lower):
        score += 25
        reasons.append("Pattern file hosting (random ID + archive)")
    
    # 7. Check multi-part archive pattern
    if re.search(r'\.part\d+\.rar', url_lower) or re.search(r'\.part\d+\.zip', url_lower):
        score += 15
        reasons.append("Multi-part archive (ciri khas crack distribution)")
    
    return score, reasons


# ============================================
# FUNGSI UTAMA: HEURISTIC ANALYSIS
# ============================================
def heuristic_analysis(url: str) -> dict:
    """Analisis heuristik untuk zero-day threats"""
    score = 0
    reasons = []

    extracted = tldextract.extract(url)
    domain = extracted.domain.lower()
    subdomain = extracted.subdomain.lower()
    tld = extracted.suffix.lower()
    
    full_domain = f"{subdomain}.{domain}.{tld}" if subdomain else f"{domain}.{tld}"

    # ============================================
    # A. Deteksi IP Address
    # ============================================
    try:
        ipaddress.ip_address(domain)
        score += 30
        reasons.append("URL menggunakan Alamat IP mentah")
    except ValueError:
        pass

    # ============================================
    # B. Deteksi Keyword JUDI 
    # ============================================
    matched_gambling = []
    for keyword in GAMBLING_KEYWORDS:
        if keyword in url.lower() or keyword in full_domain.lower():
            matched_gambling.append(keyword)
    
    if matched_gambling:
        # JUDI = LANGSUNG BERBAHAYA!
        score += 70  # Langsung tinggi!
        reasons.append(f"Website judi terdeteksi: {', '.join(matched_gambling[:5])}")

    # ============================================
    #  B.5 Deteksi PIRACY / CRACK (NEW!)
    # ============================================
    piracy_score, piracy_reasons = detect_piracy_indicators(url, full_domain)
    if piracy_score > 0:
        score += piracy_score
        reasons.extend(piracy_reasons)

    # ============================================
    # C. Deteksi Keyword Phishing
    # ============================================
    matched_keywords = []
    for keyword in SUSPICIOUS_KEYWORDS:
        if keyword in url.lower():
            matched_keywords.append(keyword)
    
    if matched_keywords:
        points = min(len(matched_keywords) * 10, 30)
        score += points
        reasons.append(f"Keyword mencurigakan: {', '.join(matched_keywords[:3])}")

    # ============================================
    # D. Deteksi Brand Impersonation
    # ============================================
    for brand in BRANDS:
        distance = Levenshtein.distance(domain, brand)
        if 0 < distance <= 2 and abs(len(domain) - len(brand)) <= 2:
            score += 25
            reasons.append(f"Domain meniru brand: {brand}")
            break
        if brand in domain and domain != brand:
            score += 15
            reasons.append(f"Menggunakan nama brand: {brand}")
            break

    # ============================================
    # E. Deteksi TLD Mencurigakan
    # ============================================
    if tld in SUSPICIOUS_TLDS:
        score += 20
        reasons.append(f"TLD .{tld} sering dipakai judi/phishing")

    # ============================================
    # F. Deteksi Pola Domain Aneh
    # ============================================
    # Domain dengan angka + huruf random (game001, lele189c)
    if re.search(r'[a-z]+\d+', domain) and len(domain) > 8:
        score += 15
        reasons.append("Domain dengan pola angka-huruf acak")
    
    # Subdomain terlalu dalam
    if subdomain and len(subdomain.split(".")) > 2:
        score += 10
        reasons.append("Subdomain terlalu dalam")
    
    # Banyak tanda hubung
    hyphen_count = full_domain.count('-')
    if hyphen_count >= 2:
        score += 10
        reasons.append("Banyak tanda hubung (-)")
    
    # URL sangat panjang
    if len(url) > 100:
        score += 10
        reasons.append("URL sangat panjang")

    # ============================================
    # G. Whitelist Domain Terpercaya
    # ============================================
    is_trusted = tld in TRUSTED_TLDS
    
    if is_trusted:
        # Kurangi skor untuk domain terpercaya
        score = max(0, score - 50)
        reasons.insert(0, f"Domain terpercaya (TLD: .{tld})")

    # Cap score di 100
    score = min(score, 100)

    return {
        "score": score,
        "reasons": reasons,
        "is_trusted_domain": is_trusted
    }