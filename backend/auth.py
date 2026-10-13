"""Autentikasi sederhana untuk prototype.

- Pengguna disimpan di ``backend/data/users.json`` (dibuat otomatis saat
  register pertama). Password TIDAK disimpan mentah, melainkan hash
  werkzeug (scrypt).
- Sesi memakai token acak (secrets) yang disimpan di memori server dengan
  masa berlaku 24 jam. Untuk prototype/skripsi ini cukup; untuk produksi
  gunakan JWT / sesi database.

Endpoint (didaftarkan di app.py):
  POST /auth/register  {name, email, password} -> 201 {token, user}
  POST /auth/login     {email, password}       -> 200 {token, user}
  GET  /auth/me        (Authorization: Bearer <token>) -> 200 {user}
  POST /auth/logout    (Authorization: Bearer <token>) -> 200 {ok: true}
"""
import json
import re
import secrets
import time
from pathlib import Path

from werkzeug.security import check_password_hash, generate_password_hash

DATA_DIR = Path(__file__).parent / "data"
USERS_PATH = DATA_DIR / "users.json"

# Token -> {"email": str, "name": str, "exp": float}
_SESI = {}
MASA_BERLAKU_DETIK = 24 * 3600
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _muat_users():
    if not USERS_PATH.exists():
        return {}
    try:
        data = json.loads(USERS_PATH.read_text(encoding="utf-8"))
        return data if isinstance(data, dict) else {}
    except (json.JSONDecodeError, OSError):
        return {}


def _simpan_users(users):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    USERS_PATH.write_text(json.dumps(users, ensure_ascii=False, indent=2),
                          encoding="utf-8")


def _buat_token(email, name):
    token = secrets.token_urlsafe(32)
    _SESI[token] = {"email": email, "name": name,
                    "exp": time.time() + MASA_BERLAKU_DETIK}
    return token


def _bersihkan_sesi_kadaluarsa():
    now = time.time()
    for tok in [t for t, s in _SESI.items() if s["exp"] < now]:
        del _SESI[tok]


def user_dari_token(token):
    """Kembalikan {"email", "name"} bila token valid, else None."""
    if not token:
        return None
    _bersihkan_sesi_kadaluarsa()
    sesi = _SESI.get(token)
    if not sesi:
        return None
    return {"email": sesi["email"], "name": sesi["name"]}


def token_dari_header(auth_header):
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    return auth_header[len("Bearer "):].strip() or None


def register(name, email, password):
    name = (name or "").strip()
    email = (email or "").strip().lower()
    password = password or ""
    if not name:
        return None, ("Nama wajib diisi", 400)
    if not EMAIL_RE.match(email):
        return None, ("Format email tidak valid", 400)
    if len(password) < 6:
        return None, ("Password minimal 6 karakter", 400)
    users = _muat_users()
    if email in users:
        return None, ("Email sudah terdaftar", 409)
    users[email] = {
        "name": name,
        "password_hash": generate_password_hash(password),
        "dibuat": time.strftime("%Y-%m-%d %H:%M:%S"),
    }
    _simpan_users(users)
    token = _buat_token(email, name)
    return {"token": token, "user": {"email": email, "name": name}}, (None, 201)


def login(email, password):
    email = (email or "").strip().lower()
    users = _muat_users()
    rec = users.get(email)
    if not rec or not check_password_hash(rec.get("password_hash", ""),
                                          password or ""):
        return None, ("Email atau password salah", 401)
    token = _buat_token(email, rec["name"])
    return {"token": token,
            "user": {"email": email, "name": rec["name"]}}, (None, 200)


def logout(token):
    if token in _SESI:
        del _SESI[token]
    return {"ok": True}, (None, 200)
