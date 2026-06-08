# services/analyzer_service.py
import asyncio
from .threat_analyzer import ThreatAnalyzer

_analyzer = ThreatAnalyzer()

async def analyze_url(url: str):
    """Wrapper untuk ThreatAnalyzer"""
    try:
        result = await _analyzer.analyze(url)
        return result

    except Exception as e:
        print(f"❌ Analyzer Error: {e}")
        return {
            "score": 0,
            "level": "SAFE",
            "reasons": [f"Analisis gagal: {str(e)}"],
            "summary": "Terjadi kesalahan saat analisis URL.",
            "recommendation": "Silakan coba lagi.",
            "is_valid_url": None,
            "screenshot": None
        }