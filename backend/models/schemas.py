from pydantic import BaseModel, EmailStr


class ChatRequest(BaseModel):
    message: str
    chat_history: list = []


class URLRequest(BaseModel):
    url: str


class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    phone: str = ""
    location: str = ""


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ChangePasswordRequest(BaseModel):
    email: EmailStr
    old_password: str
    new_password: str