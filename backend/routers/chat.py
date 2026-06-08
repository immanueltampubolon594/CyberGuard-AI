from fastapi import APIRouter, HTTPException
from services.rag_service import CyberGuardRAG
from models.schemas import ChatRequest

router = APIRouter(tags=["AI Engine"])
bot = CyberGuardRAG()

GREETINGS = ["halo", "hai", "hello", "pagi", "siang", "sore", "malam", "p"]


@router.post("/chat")
async def chat_endpoint(request: ChatRequest):
    """Chatbot Edukatif berbasis RAG (Retrieval-Augmented Generation)."""
    try:
        user_msg = request.message.lower().strip()

        if len(user_msg.split()) < 3 and any(g == user_msg for g in GREETINGS):
            return {
                "reply": "Halo! Saya CyberGuard AI. Ada yang bisa saya bantu terkait literasi keamanan siber atau verifikasi ancaman hari ini?",
                "risk": 15,
                "findings": []
            }

        return await bot.get_response(request.message, request.chat_history)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Engine Error: {str(e)}")