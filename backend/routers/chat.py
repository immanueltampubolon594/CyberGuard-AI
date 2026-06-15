# Import router FastAPI
from fastapi import APIRouter, HTTPException

# Import chatbot RAG
from services.rag_service import CyberGuardRAG

# Import schema request
from models.schemas import ChatRequest

# Import koneksi Supabase
from database.supabase_client import get_supabase


# Setup router
router = APIRouter(tags=["AI Engine"])

# Setup chatbot
bot = CyberGuardRAG()

# Setup Supabase
supabase = get_supabase()


# List sapaan user
GREETINGS = [
    "halo",
    "hai",
    "hello",
    "pagi",
    "siang",
    "sore",
    "malam",
    "p"
]


# Endpoint chat utama
@router.post("/chat")
async def chat_endpoint(request: ChatRequest):

    """Chatbot berbasis RAG"""

    try:

        # Ambil pesan user
        user_msg = request.message.lower().strip()

        # Cek greeting pendek
        if len(user_msg.split()) < 3 and any(
            g == user_msg
            for g in GREETINGS
        ):

            # Return sapaan chatbot
            return {
                "reply":
                    "Halo! Saya CyberGuard AI. "
                    "Ada yang bisa saya bantu terkait "
                    "literasi keamanan siber atau "
                    "verifikasi ancaman hari ini?",

                "risk": 15,
                "findings": []
            }

        # Jalankan chatbot RAG
        return await bot.get_response(
            request.message,
            request.chat_history
        )

    except Exception as e:

        # Error chatbot
        raise HTTPException(
            status_code=500,
            detail=f"AI Engine Error: {str(e)}"
        )


# Endpoint simpan chat
@router.post("/chat/save")
async def save_session(data: dict):

    """Simpan session chat"""

    try:

        # Cek session sudah ada
        existing = supabase.table("chat_sessions") \
            .select("id") \
            .eq("session_id", data["session_id"]) \
            .execute()

        # Jika session sudah ada
        if existing.data:

            # Update session lama
            supabase.table("chat_sessions").update({

                "messages": data["messages"],
                "title": data["title"],
                "updated_at": "now()"

            }).eq(
                "session_id",
                data["session_id"]
            ).execute()

        else:

            # Simpan session baru
            supabase.table("chat_sessions").insert({

                "user_email": data["user_email"],
                "session_id": data["session_id"],
                "title": data["title"],
                "messages": data["messages"]

            }).execute()

        # Status berhasil
        return {"status": "success"}

    except Exception as e:

        # Print error save
        print(f"[SAVE ERROR]: {e}")

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# Endpoint ambil history chat
@router.get("/chat/history/{user_email}")
async def get_history(user_email: str):

    """Ambil history chat user"""

    try:

        # Ambil semua session user
        result = supabase.table("chat_sessions") \
            .select("*") \
            .eq("user_email", user_email) \
            .order("updated_at", desc=True) \
            .execute()

        # Return history chat
        return {
            "sessions": result.data
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )