"""Autentikasi + data per akun, seluruhnya di PostgreSQL.

- Akun tersimpan di tabel ``users``. Password TIDAK disimpan mentah,
  melainkan hash werkzeug (scrypt).
- Sesi memakai token acak (secrets); yang tersimpan di tabel ``sesi``
  hanya hash SHA-256 token, dengan masa berlaku 24 jam.
- Skill profil di ``profil_skill``, progress quest di ``quest_progress``,
  riwayat rekomendasi di ``riwayat``.

Endpoint (didaftarkan di app.py):
  POST /auth/register  {name, email, password} -> 201 {token, user}
  POST /auth/login     {email, password}       -> 200 {token, user}
  GET  /auth/me        (Authorization: Bearer <token>) -> 200 {user}
  POST /auth/logout    (Authorization: Bearer <token>) -> 200 {ok: true}
"""
import hashlib
import re
import secrets
from datetime import datetime, timedelta

from werkzeug.security import check_password_hash, generate_password_hash

from db import (Pekerjaan, ProfilSkill, QuestProgress, Riwayat,
                RiwayatHasil, RiwayatMinat, RiwayatSkill, Sesi, Users,
                sesi_db)

MASA_BERLAKU_DETIK = 24 * 3600
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
_FMT_WAKTU = "%Y-%m-%d %H:%M:%S"


def _hash_token(token):
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def _buat_token(user_id):
    token = secrets.token_urlsafe(32)
    with sesi_db() as s:
        s.add(Sesi(token_hash=_hash_token(token), user_id=user_id,
                   exp=datetime.now() + timedelta(seconds=MASA_BERLAKU_DETIK)))
        s.commit()
    return token


def user_dari_token(token):
    """Kembalikan {"email", "name"} bila token valid, else None."""
    if not token:
        return None
    with sesi_db() as s:
        sesi = s.query(Sesi).filter_by(token_hash=_hash_token(token)).first()
        if not sesi:
            return None
        if sesi.exp < datetime.now():
            s.delete(sesi)
            s.commit()
            return None
        return {"email": sesi.user.email, "name": sesi.user.nama}


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
    with sesi_db() as s:
        if s.query(Users).filter_by(email=email).first():
            return None, ("Email sudah terdaftar", 409)
        user = Users(nama=name, email=email,
                     password_hash=generate_password_hash(password))
        s.add(user)
        s.commit()
        user_id = user.id
    token = _buat_token(user_id)
    return {"token": token, "user": {"email": email, "name": name}}, (None, 201)


def login(email, password):
    email = (email or "").strip().lower()
    with sesi_db() as s:
        rec = s.query(Users).filter_by(email=email).first()
        if not rec or not check_password_hash(rec.password_hash,
                                              password or ""):
            return None, ("Email atau password salah", 401)
        user_id, nama = rec.id, rec.nama
    token = _buat_token(user_id)
    return {"token": token,
            "user": {"email": email, "name": nama}}, (None, 200)


def logout(token):
    if token:
        with sesi_db() as s:
            sesi = s.query(Sesi).filter_by(token_hash=_hash_token(token)).first()
            if sesi:
                s.delete(sesi)
                s.commit()
    return {"ok": True}, (None, 200)


# ---------------------------------------------------------------------------
# Profil, quest roadmap, dan riwayat (tersimpan per akun di PostgreSQL).
# ---------------------------------------------------------------------------

def get_profil(email):
    email = (email or "").strip().lower()
    with sesi_db() as s:
        rec = s.query(Users).filter_by(email=email).first()
        if not rec:
            return None
        skills = [r.skill for r in s.query(ProfilSkill)
                  .filter_by(user_id=rec.id).order_by(ProfilSkill.urutan)]
        return {"name": rec.nama, "email": email, "skills": skills}


def simpan_skills(email, skills):
    """Simpan daftar skill pengguna. Kembalikan (ok, pesan_error)."""
    email = (email or "").strip().lower()
    bersih = []
    terlihat = set()
    for sk in skills or []:
        nama = (sk or "").strip()
        if not nama or len(nama) > 40:
            continue
        kunci = nama.lower()
        if kunci not in terlihat:
            terlihat.add(kunci)
            bersih.append(nama)
        if len(bersih) >= 60:
            break
    with sesi_db() as s:
        rec = s.query(Users).filter_by(email=email).first()
        if not rec:
            return False, "Akun tidak ditemukan"
        s.query(ProfilSkill).filter_by(user_id=rec.id).delete()
        for i, nama in enumerate(bersih):
            s.add(ProfilSkill(user_id=rec.id, skill=nama, urutan=i))
        s.commit()
    return True, None


def get_quests(email):
    email = (email or "").strip().lower()
    with sesi_db() as s:
        rec = s.query(Users).filter_by(email=email).first()
        if not rec:
            return {}
        rows = (s.query(QuestProgress).filter_by(user_id=rec.id)
                .order_by(QuestProgress.karier_id, QuestProgress.langkah))
        quests = {}
        for r in rows:
            quests.setdefault(r.karier_id, []).append(r.langkah)
        return quests


def set_quest(email, karier_id, langkah, selesai):
    """Tandai satu langkah quest selesai/belum. Kembalikan (ok, pesan)."""
    email = (email or "").strip().lower()
    with sesi_db() as s:
        rec = s.query(Users).filter_by(email=email).first()
        if not rec:
            return False, "Akun tidak ditemukan"
        try:
            langkah = int(langkah)
        except (TypeError, ValueError):
            return False, "Nomor langkah tidak valid"
        baris = (s.query(QuestProgress)
                 .filter_by(user_id=rec.id, karier_id=karier_id,
                            langkah=langkah).first())
        if selesai and not baris:
            s.add(QuestProgress(user_id=rec.id, karier_id=karier_id,
                                langkah=langkah))
        elif not selesai and baris:
            s.delete(baris)
        s.commit()
    return True, None


def tambah_riwayat(email, entri):
    """Simpan satu hasil rekomendasi ke riwayat akun (maks 50).

    Satu entri = satu baris riwayat + baris-baris anak di
    riwayat_skill / riwayat_minat / riwayat_hasil.
    """
    email = (email or "").strip().lower()
    try:
        waktu = datetime.strptime(entri.get("waktu", ""), _FMT_WAKTU)
    except (ValueError, TypeError):
        waktu = datetime.now()
    with sesi_db() as s:
        rec = s.query(Users).filter_by(email=email).first()
        if not rec:
            return False
        header = Riwayat(user_id=rec.id, waktu=waktu)
        s.add(header)
        s.flush()
        for i, nama in enumerate(entri.get("skills", [])):
            s.add(RiwayatSkill(riwayat_id=header.id, urutan=i, skill=nama))
        for i, kat in enumerate(entri.get("minat", [])):
            s.add(RiwayatMinat(riwayat_id=header.id, urutan=i, kategori=kat))
        for i, h in enumerate(entri.get("hasil", [])):
            s.add(RiwayatHasil(riwayat_id=header.id, urutan=i,
                               karier_id=h.get("id"),
                               skor_akhir=float(h.get("skor_akhir", 0))))
        s.commit()
        dipertahankan = [r.id for r in s.query(Riwayat)
                         .filter_by(user_id=rec.id)
                         .order_by(Riwayat.id.desc()).limit(50)]
        s.query(Riwayat).filter(
            Riwayat.user_id == rec.id,
            ~Riwayat.id.in_(dipertahankan)).delete(synchronize_session=False)
        s.commit()
    return True


def get_riwayat(email):
    email = (email or "").strip().lower()
    with sesi_db() as s:
        rec = s.query(Users).filter_by(email=email).first()
        if not rec:
            return []
        hasil = []
        for r in (s.query(Riwayat).filter_by(user_id=rec.id)
                  .order_by(Riwayat.id.desc())):
            skills = [x.skill for x in s.query(RiwayatSkill)
                      .filter_by(riwayat_id=r.id).order_by(RiwayatSkill.urutan)]
            minat = [x.kategori for x in s.query(RiwayatMinat)
                     .filter_by(riwayat_id=r.id).order_by(RiwayatMinat.urutan)]
            daftar_hasil = []
            for x in (s.query(RiwayatHasil)
                      .filter_by(riwayat_id=r.id).order_by(RiwayatHasil.urutan)):
                pekerjaan = s.query(Pekerjaan).filter_by(id=x.karier_id).first()
                daftar_hasil.append({
                    "id": x.karier_id,
                    "nama": pekerjaan.nama if pekerjaan else x.karier_id,
                    "skor_akhir": float(x.skor_akhir),
                })
            hasil.append({"waktu": r.waktu.strftime(_FMT_WAKTU),
                          "skills": skills, "minat": minat,
                          "hasil": daftar_hasil})
        return hasil
