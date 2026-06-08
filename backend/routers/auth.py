from fastapi import APIRouter, HTTPException
from database.supabase_client import get_supabase
from services.auth_service import AuthService
from models.schemas import RegisterRequest, LoginRequest, ChangePasswordRequest

router = APIRouter(prefix="/auth", tags=["Authentication"])
auth = AuthService()
supabase = get_supabase()


@router.post("/register")
async def register(user: RegisterRequest):
    """Mendaftarkan pengguna baru dengan enkripsi Bcrypt."""
    existing = supabase.table("users").select("email").eq("email", user.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Alamat email sudah terdaftar di sistem.")

    password_hash = auth.hash_password(user.password)

    try:
        supabase.table("users").insert({
            "full_name": user.full_name,
            "email": user.email,
            "password_hash": password_hash,
            "phone": user.phone,
            "location": user.location
        }).execute()
        return {"status": "success", "message": "Akun berhasil dibuat. Silakan login."}
    except Exception as e:
        print(f"[AUTH ERROR]: Fallback triggered: {e}")
        try:
            supabase.table("users").insert({
                "full_name": user.full_name,
                "email": user.email,
                "password_hash": password_hash
            }).execute()
            return {"status": "success", "message": "Registrasi berhasil (Basic Profile)."}
        except Exception as e2:
            raise HTTPException(status_code=500, detail=f"Gagal memproses pendaftaran: {str(e2)}")


@router.post("/login")
async def login(credentials: LoginRequest):
    """Verifikasi kredensial dan memberikan JWT Access Token."""
    res = supabase.table("users").select("*").eq("email", credentials.email).execute()

    if not res.data:
        raise HTTPException(status_code=401, detail="Email atau password tidak valid.")

    user = res.data[0]
    if not auth.verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Email atau password tidak valid.")

    token = auth.create_access_token(data={"sub": user["email"]})

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


@router.post("/change-password")
async def change_password(data: ChangePasswordRequest):
    """Mengubah password pengguna setelah validasi password lama."""
    res = supabase.table("users").select("*").eq("email", data.email).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="User tidak ditemukan.")

    user = res.data[0]
    if not auth.verify_password(data.old_password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Password lama salah.")

    new_hash = auth.hash_password(data.new_password)
    supabase.table("users").update({"password_hash": new_hash}).eq("email", data.email).execute()

    return {"status": "success", "message": "Password telah diperbarui secara aman."}