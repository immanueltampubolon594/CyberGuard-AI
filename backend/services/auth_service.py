# Import environment variable
import os

# Import waktu dan timezone
from datetime import datetime, timedelta, timezone

# Import JWT token
from jose import jwt

# Import bcrypt password hashing
from passlib.context import CryptContext

# Load file .env
from dotenv import load_dotenv


# Load environment variable
load_dotenv()


# Setup enkripsi password bcrypt
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


# Secret key JWT
SECRET_KEY = os.getenv(
    "JWT_SECRET_KEY",
    "CyberGuard_Secret_Key_Secure_2026_!@#"
)

# Algoritma JWT
ALGORITHM = "HS256"

# Lama token aktif
ACCESS_TOKEN_EXPIRE_MINUTES = 1440


class AuthService:

    # Encrypt password
    def hash_password(
        self,
        password: str
    ) -> str:

        # Potong password max 72 karakter
        return pwd_context.hash(
            password[:72]
        )


    # Verifikasi password
    def verify_password(
        self,
        plain_password: str,
        hashed_password: str
    ) -> bool:

        try:

            # Cek password user
            return pwd_context.verify(
                plain_password[:72],
                hashed_password
            )

        except Exception:

            return False


    # Generate JWT token
    def create_access_token(
        self,
        data: dict
    ):

        # Copy payload data
        to_encode = data.copy()

        # Set waktu expired token
        expire = datetime.now(
            timezone.utc
        ) + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )

        # Tambahkan expired time
        to_encode.update({
            "exp": expire
        })

        # Encode JWT token
        encoded_jwt = jwt.encode(
            to_encode,
            SECRET_KEY,
            algorithm=ALGORITHM
        )

        # Return token
        return encoded_jwt


    # Ambil user dari JWT token
    def get_user_from_token(
        self,
        token: str
    ):

        try:

            # Decode JWT token
            payload = jwt.decode(
                token,
                SECRET_KEY,
                algorithms=[ALGORITHM]
            )

            # Ambil email user
            return payload.get("sub")

        except:

            return None