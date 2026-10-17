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


# ---------------------------------------------------------------------------
# Profil, quest roadmap, dan riwayat (tersimpan per akun di users.json).
# Inilah fungsi login: data pengguna mengikuti akunnya di mana pun ia masuk.
# ---------------------------------------------------------------------------

def _default_profil():
    return {"skills": [], "quests": {}, "riwayat": []}


def get_user_record(email):
    """Kembalikan record user lengkap (atau None)."""
    return _muat_users().get((email or "").strip().lower())


def get_profil(email):
    rec = get_user_record(email)
    if not rec:
        return None
    return {
        "name": rec.get("name", ""),
        "email": (email or "").strip().lower(),
        "skills": list(rec.get("skills", [])),
    }


def simpan_skills(email, skills):
    """Simpan daftar skill pengguna. Kembalikan (ok, pesan_error)."""
    email = (email or "").strip().lower()
    bersih = []
    terlihat = set()
    for s in skills or []:
        nama = (s or "").strip()
        if not nama or len(nama) > 40:
            continue
        kunci = nama.lower()
        if kunci not in terlihat:
            terlihat.add(kunci)
            bersih.append(nama)
        if len(bersih) >= 60:
            break
    users = _muat_users()
    rec = users.get(email)
    if not rec:
        return False, "Akun tidak ditemukan"
    rec["skills"] = bersih
    _simpan_users(users)
    return True, None


def get_quests(email):
    rec = get_user_record(email)
    return dict(rec.get("quests", {})) if rec else {}


def set_quest(email, karier_id, langkah, selesai):
    """Tandai satu langkah quest selesai/belum. Kembalikan (ok, pesan)."""
    email = (email or "").strip().lower()
    users = _muat_users()
    rec = users.get(email)
    if not rec:
        return False, "Akun tidak ditemukan"
    try:
        langkah = int(langkah)
    except (TypeError, ValueError):
        return False, "Nomor langkah tidak valid"
    quests = rec.setdefault("quests", {})
    daftar = quests.setdefault(karier_id, [])
    if selesai and langkah not in daftar:
        daftar.append(langkah)
    elif not selesai and langkah in daftar:
        daftar.remove(langkah)
    quests[karier_id] = sorted(daftar)
    _simpan_users(users)
    return True, None


def tambah_riwayat(email, entri):
    """Simpan satu hasil rekomendasi ke riwayat akun (maks 50)."""
    email = (email or "").strip().lower()
    users = _muat_users()
    rec = users.get(email)
    if not rec:
        return False
    riwayat = rec.setdefault("riwayat", [])
    riwayat.insert(0, entri)
    del riwayat[50:]
    _simpan_users(users)
    return True


def get_riwayat(email):
    rec = get_user_record(email)
    return list(rec.get("riwayat", [])) if rec else []
