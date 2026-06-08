import os
from datetime import datetime, timedelta, timezone # Tambahkan timezone
from jose import jwt
from passlib.context import CryptContext
from dotenv import load_dotenv

load_dotenv()

# 1. KONFIGURASI ENKRIPSI PASSWORD
# Kita tambahkan konfigurasi khusus agar passlib tidak bentrok dengan versi bcrypt terbaru
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 2. KONFIGURASI JWT (JSON Web Token)
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "CyberGuard_Secret_Key_Secure_2026_!@#")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440 

class AuthService:
    def hash_password(self, password: str) -> str:
        # Bcrypt punya batasan 72 karakter. Kita potong (truncate) 
        # otomatis agar tidak menyebabkan ValueError seperti di log tadi.
        return pwd_context.hash(password[:72])

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        # Verifikasi juga dipotong 72 karakter agar sinkron
        try:
            return pwd_context.verify(plain_password[:72], hashed_password)
        except Exception:
            return False

    def create_access_token(self, data: dict):
        to_encode = data.copy()
        # Gunakan timezone.utc agar tidak muncul warning 'deprecated' di Python terbaru
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

    def get_user_from_token(self, token: str):
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload.get("sub") 
        except:
            return None 