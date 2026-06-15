# Import BaseModel dan Email validator
from pydantic import BaseModel, EmailStr


# Schema request chatbot
class ChatRequest(BaseModel):

    # Pesan user
    message: str

    # Riwayat chat
    chat_history: list = []


# Schema request URL checker
class URLRequest(BaseModel):

    # URL input user
    url: str


# Schema register user
class RegisterRequest(BaseModel):

    # Nama lengkap
    full_name: str

    # Email user
    email: EmailStr

    # Password user
    password: str

    # Nomor telepon
    phone: str = ""

    # Lokasi user
    location: str = ""


# Schema login user
class LoginRequest(BaseModel):

    # Email login
    email: EmailStr

    # Password login
    password: str


# Schema ganti password
class ChangePasswordRequest(BaseModel):

    # Email user
    email: EmailStr

    # Password lama
    old_password: str

    # Password baru
    new_password: str