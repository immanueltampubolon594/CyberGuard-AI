# Jalankan FastAPI server
import uvicorn

# Load environment variable
from dotenv import load_dotenv

# Import FastAPI
from fastapi import FastAPI

# Import middleware CORS
from fastapi.middleware.cors import CORSMiddleware

# Validasi request model
from pydantic import BaseModel

# Import router endpoint
from routers import auth, chat, voice


# Import service deskripsi link (fitur Verifikasi)
from services.threat.link_info import deskripsikan_link

# Load file .env
load_dotenv()


# Inisialisasi aplikasi FastAPI
app = FastAPI(

    # Nama backend system
    title="CyberGuard AI - Enterprise Security Backend",

    # Deskripsi backend
    description=
    "Sistem Terintegrasi: AI Chatbot RAG, "
    "Autentikasi JWT, dan Multi-Engine Threat Verification.",

    # Versi aplikasi
    version="4.0.0"
)


# Konfigurasi CORS frontend
app.add_middleware(

    # Middleware CORS
    CORSMiddleware,

    # Origin frontend yang diizinkan
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://cyber-guard-ai-delta.vercel.app",
        "https://cyber-guard-ai-git-main-sontrom.vercel.app",
        "https://cyber-guard-cdd3ont9c-sontrom.vercel.app"
    ],

    # Izinkan credentials
    allow_credentials=True,

    # Izinkan semua method
    allow_methods=["*"],

    # Izinkan semua header
    allow_headers=["*"],
)

# Schema request verifikasi URL
class URLRequest(BaseModel):

    # URL input user
    url: str


# Registrasi router auth
app.include_router(auth.router)

# Registrasi router chatbot
app.include_router(chat.router)

# Registrasi router voice
app.include_router(voice.router)


# Endpoint health check system
@app.get("/", tags=["System"])
def health_check():

    # Return status backend
    return {
        "status": "online",
        "message": "CyberGuard Neural Engine is fully active.",
        "version": "4.0.0 (Production Ready)"
    }


# Endpoint verifikasi URL (versi deskripsi link)
# Mengembalikan gambaran tentang link: jenis situs, negara server,
# dan tanggal domain terdaftar. Tidak ada skor risiko.
@app.post("/verify-link", tags=["Security Tools"])
async def verify_link(data: URLRequest):

    try:

        # Susun deskripsi link
        info = await deskripsikan_link(data.url)

        # Log monitoring backend
        print(f"{data.url} → {info.get('kode_jenis')}")

        # Response hasil
        return {
            "success": True,
            "url": data.url,
            "info": info
        }

    except Exception as e:

        # Log error backend
        print(f"Verify Error: {e}")

        # Response error
        return {
            "success": False,
            "url": data.url,
            "error": "Sistem mengalami masalah saat membaca link. Silakan coba lagi."
        }


# Jalankan backend server
if __name__ == "__main__":

    uvicorn.run(

        # File utama FastAPI
        "main:app",

        # Host backend
        host="127.0.0.1",

        # Port backend
        port=8000,

        # Auto reload development
        reload=True
    )