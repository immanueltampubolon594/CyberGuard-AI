# Import router FastAPI
from fastapi import APIRouter, HTTPException

# Import koneksi Supabase
from database.supabase_client import get_supabase

# Import service authentication
from services.auth_service import AuthService

# Import schema request
from models.schemas import (
    RegisterRequest,
    LoginRequest,
    ChangePasswordRequest
)


# Setup router authentication
router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

# Setup auth service
auth = AuthService()

# Setup Supabase
supabase = get_supabase()


# Endpoint register user
@router.post("/register")
async def register(user: RegisterRequest):

    """Registrasi user baru"""

    # Cek email sudah terdaftar
    existing = supabase.table("users") \
        .select("email") \
        .eq("email", user.email) \
        .execute()

    # Jika email sudah ada
    if existing.data:

        raise HTTPException(
            status_code=400,
            detail="Alamat email sudah terdaftar di sistem."
        )

    # Encrypt password menggunakan bcrypt
    password_hash = auth.hash_password(
        user.password
    )

    try:

        # Simpan user ke database
        supabase.table("users").insert({

            "full_name": user.full_name,
            "email": user.email,
            "password_hash": password_hash,
            "phone": user.phone,
            "location": user.location

        }).execute()

        # Return berhasil
        return {
            "status": "success",
            "message":
                "Akun berhasil dibuat. "
                "Silakan login."
        }

    except Exception as e:

        # Print fallback error
        print(f"[AUTH ERROR]: Fallback triggered: {e}")

        try:

            # Simpan basic profile jika gagal
            supabase.table("users").insert({

                "full_name": user.full_name,
                "email": user.email,
                "password_hash": password_hash

            }).execute()

            return {
                "status": "success",
                "message":
                    "Registrasi berhasil "
                    "(Basic Profile)."
            }

        except Exception as e2:

            raise HTTPException(
                status_code=500,
                detail=
                    f"Gagal memproses "
                    f"pendaftaran: {str(e2)}"
            )


# Endpoint login user
@router.post("/login")
async def login(credentials: LoginRequest):

    """Login dan generate JWT token"""

    # Cari user berdasarkan email
    res = supabase.table("users") \
        .select("*") \
        .eq("email", credentials.email) \
        .execute()

    # Jika user tidak ditemukan
    if not res.data:

        raise HTTPException(
            status_code=401,
            detail=
                "Email atau password "
                "tidak valid."
        )

    # Ambil data user
    user = res.data[0]

    # Verifikasi password
    if not auth.verify_password(
        credentials.password,
        user["password_hash"]
    ):

        raise HTTPException(
            status_code=401,
            detail=
                "Email atau password "
                "tidak valid."
        )

    # Generate JWT token
    token = auth.create_access_token(
        data={"sub": user["email"]}
    )

    # Return login berhasil
    return {

        "status": "success",

        "access_token": token,

        "user": {

            "full_name": user["full_name"],
            "email": user["email"],
            "phone": user.get("phone", ""),
            "location": user.get("location", "")
        }
    }


# Endpoint ganti password
@router.post("/change-password")
async def change_password(
    data: ChangePasswordRequest
):

    """Ganti password user"""

    # Cari user berdasarkan email
    res = supabase.table("users") \
        .select("*") \
        .eq("email", data.email) \
        .execute()

    # Jika user tidak ditemukan
    if not res.data:

        raise HTTPException(
            status_code=404,
            detail="User tidak ditemukan."
        )

    # Ambil data user
    user = res.data[0]

    # Verifikasi password lama
    if not auth.verify_password(
        data.old_password,
        user["password_hash"]
    ):

        raise HTTPException(
            status_code=401,
            detail="Password lama salah."
        )

    # Encrypt password baru
    new_hash = auth.hash_password(
        data.new_password
    )

    # Update password baru
    supabase.table("users").update({

        "password_hash": new_hash

    }).eq(
        "email",
        data.email
    ).execute()

    # Return berhasil
    return {
        "status": "success",
        "message":
            "Password telah diperbarui "
            "secara aman."
    }