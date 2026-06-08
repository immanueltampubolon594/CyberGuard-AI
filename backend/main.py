import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel # Tambahan untuk validasi request model

from routers import auth, chat
from services.analyzer_service import analyze_url # Tambahan untuk logika verifikasi

load_dotenv()

# ── Inisialisasi Aplikasi ────────────────────────────────────
app = FastAPI(
    title="CyberGuard AI - Enterprise Security Backend",
    description="Sistem Terintegrasi: AI Chatbot RAG, Autentikasi JWT, dan Multi-Engine Threat Verification.",
    version="4.0.0"
)

# ── Konfigurasi CORS ─────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Request Model Tambahan ───────────────────────────────────
class URLRequest(BaseModel):
    url: str

# ── Registrasi Router ────────────────────────────────────────
app.include_router(auth.router)
app.include_router(chat.router)

# ── Status Sistem ────────────────────────────────────────────
@app.get("/", tags=["System"])
def health_check():
    """Mengecek status kesehatan API."""
    return {
        "status": "online",
        "message": "CyberGuard Neural Engine is fully active.",
        "version": "4.0.0 (Production Ready)"
    }

# ── THREAT VERIFICATION (Verifikasi Link) ────────────────────
@app.post("/verify-link", tags=["Security Tools"])
async def verify_link(data: URLRequest):
    """Verifikasi URL menggunakan sistem Multi-Engine Analyzer."""
    try:
        result = await analyze_url(data.url)
        
        response = {
            "success": True,
            "url": data.url,
            "risk": result
        }
        
        # Log singkat saja
        score = result.get('score', 0)
        level = result.get('level', 'UNKNOWN')
        print(f"✅ {data.url} → {score}% ({level})")
        
        return response
    
    except Exception as e:
        print(f"❌ Verify Error: {e}")
        return {
            "success": False,
            "url": data.url,
            "error": str(e),
            "risk": {
                "score": 0,
                "level": "SAFE",
                "reasons": [f"Error: {str(e)}"],
                "summary": "Sistem mengalami masalah.",
                "recommendation": "Silakan coba lagi.",
                "is_valid_url": None,
                "screenshot": None
            }
        }

# ── Eksekusi Server ──────────────────────────────────────────
if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)