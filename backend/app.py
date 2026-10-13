"""Backend API Sistem Rekomendasi Karier IT (Flask).

Metode:
  1. Content-Based Filtering + Cosine Similarity  -> kecocokan skill user
     terhadap profil skill tiap pekerjaan.
  2. SAW (Simple Additive Weighting)             -> gabungan skor akhir dari
     kecocokan skill, minat, gaji, dan kebutuhan pasar (demand).
     Bobot dibaca dari data/bobot.json (total harus = 1).

Autentikasi: register/login memakai token (lihat auth.py). Endpoint
POST /rekomendasi membutuhkan header "Authorization: Bearer <token>".

Konfigurasi via environment variable:
  FLASK_DEBUG=1   aktifkan debug mode (default MATI)
  CORS_ORIGINS    daftar origin dipisah koma, default http://localhost:5173
  PORT            port server, default 8000
  DATABASE_URL    bila diisi, data dibaca dari PostgreSQL (lihat db.py);
                  bila kosong/gagal, otomatis memakai data/pekerjaan.json.

Jalankan (dari folder backend/):
    python app.py
atau:
    flask --app app run --port 8000
"""
import json
import math
import os
from pathlib import Path

from flask import Flask, jsonify, request
from flask_cors import CORS

import auth

app = Flask(__name__)

# Konfigurasi: aman secara default (debug mati, CORS dibatasi)
DEBUG = os.environ.get("FLASK_DEBUG", "").strip() == "1"
PORT = int(os.environ.get("PORT", "8000"))
_origins = [o.strip() for o in
            os.environ.get("CORS_ORIGINS", "http://localhost:5173").split(",")
            if o.strip()]
CORS(app, resources={r"/*": {"origins": _origins}})

DATA_DIR = Path(__file__).parent / "data"
DATA_PATH = DATA_DIR / "pekerjaan.json"
BOBOT_PATH = DATA_DIR / "bobot.json"
PEKERJAAN = json.loads(DATA_PATH.read_text(encoding="utf-8"))


def muat_bobot():
    """Baca bobot SAW dari bobot.json; validasi total = 1."""
    try:
        bobot = json.loads(BOBOT_PATH.read_text(encoding="utf-8"))
        bobot = {k: float(v) for k, v in bobot.items()
                 if not k.startswith("_")}
    except (OSError, ValueError, json.JSONDecodeError):
        bobot = {"skill": 0.45, "minat": 0.25, "gaji": 0.15, "demand": 0.15}
    total = sum(bobot.values())
    if not bobot or abs(total - 1.0) > 1e-9:
        raise ValueError(f"Total bobot SAW harus = 1, dapat {total}")
    return bobot


BOBOT = muat_bobot()

# Coba muat dari PostgreSQL bila DATABASE_URL tersedia; fallback ke JSON
try:
    from db import muat_dari_db
    _dari_db = muat_dari_db()
    if _dari_db:
        PEKERJAAN = _dari_db
        print(f"[app] Memakai data dari PostgreSQL ({len(PEKERJAAN)} pekerjaan)")
    else:
        print(f"[app] Memakai data dari pekerjaan.json ({len(PEKERJAAN)} pekerjaan)")
except Exception as e:
    # Peringatan eksplisit: kegagalan DB jangan sampai tidak disadari.
    print(f"[app] PERINGATAN: PostgreSQL tidak dipakai ({e}); "
          f"memakai pekerjaan.json ({len(PEKERJAAN)} pekerjaan)")


def normalisasi(skill: str) -> str:
    return skill.strip().lower()


def cosine_similarity(skill_user: set, skill_job: set) -> float:
    """Cosine similarity antara himpunan skill user dan skill pekerjaan.

    Catatan keterbatasan: skill diperlakukan biner (dikuasai/tidak) tanpa
    membedakan tingkat penguasaan. Pengembangan lanjutan dapat memakai
    pembobotan TF-IDF atau skor level skill 1-5.
    """
    if not skill_user or not skill_job:
        return 0.0
    irisan = len(skill_user & skill_job)
    return irisan / (math.sqrt(len(skill_user)) * math.sqrt(len(skill_job)))


def hitung_skor(job: dict, skill_user: set, minat: dict, max_gaji: float) -> dict:
    skills_job = {normalisasi(s) for s in job["skills"]}

    # Robust: normalisasi key kategori (tahan beda kapitalisasi/spasi)
    # dan clamp nilai ke 0-5. Kunci yang hilang -> netral (3), karena
    # skala penilaian 1-5 dan frontend selalu mengirim kelima kategori.
    minat_norm = {}
    for k, v in (minat or {}).items():
        try:
            vv = float(v)
        except (TypeError, ValueError):
            continue
        minat_norm[str(k).strip().lower()] = max(0.0, min(5.0, vv))
    skor_minat = minat_norm.get(job["kategori"].strip().lower(), 3) / 5.0

    skor_skill = cosine_similarity(skill_user, skills_job)
    # Normalisasi SAW baku untuk kriteria benefit: x / max(x).
    # max_gaji dihitung per request dari data aktif agar tidak basi bila
    # data berubah tanpa restart server.
    skor_gaji = (job["gaji_max"] / max_gaji) if max_gaji > 0 else 0.0
    skor_demand = job["demand"] / 5.0

    skor_akhir = (
        BOBOT["skill"] * skor_skill
        + BOBOT["minat"] * skor_minat
        + BOBOT["gaji"] * skor_gaji
        + BOBOT["demand"] * skor_demand
    )

    cocok = sorted(skill_user & skills_job)
    kurang = sorted(skills_job - skill_user)

    return {
        "id": job["id"],
        "nama": job["nama"],
        "kategori": job["kategori"],
        "skor_akhir": round(skor_akhir, 4),
        "skor_skill": round(skor_skill, 4),
        "skor_minat": round(skor_minat, 4),
        "skor_gaji": round(skor_gaji, 4),
        "skor_demand": round(skor_demand, 4),
        "gaji_min": job["gaji_min"],
        "gaji_max": job["gaji_max"],
        "demand": job["demand"],
        "skills_cocok": cocok,
        "skills_kurang": kurang,
    }


def _user_saat_ini():
    """Kembalikan info user dari header Authorization, atau None."""
    token = auth.token_dari_header(request.headers.get("Authorization", ""))
    return auth.user_dari_token(token)


def _butuh_login():
    user = _user_saat_ini()
    if not user:
        return jsonify({"detail": "Login diperlukan"}), 401
    return None


@app.get("/")
def root():
    return jsonify({"status": "ok", "service": "API Rekomendasi Karier IT"})


@app.get("/meta")
def meta():
    skills = sorted({s for job in PEKERJAAN for s in job["skills"]}, key=str.lower)
    kategori = sorted({job["kategori"] for job in PEKERJAAN})
    return jsonify({"skills": skills, "kategori": kategori,
                    "jumlah_pekerjaan": len(PEKERJAAN)})


@app.get("/pekerjaan")
def daftar_pekerjaan():
    """Daftar semua profil pekerjaan."""
    return jsonify(PEKERJAAN)


@app.get("/pekerjaan/<pekerjaan_id>")
def detail_pekerjaan(pekerjaan_id: str):
    for job in PEKERJAAN:
        if job["id"] == pekerjaan_id:
            return jsonify(job)
    return jsonify({"detail": "Pekerjaan tidak ditemukan"}), 404


@app.get("/pekerjaan/<pekerjaan_id>/roadmap")
def roadmap_pekerjaan(pekerjaan_id: str):
    """Roadmap belajar untuk satu pekerjaan."""
    for job in PEKERJAAN:
        if job["id"] == pekerjaan_id:
            return jsonify({"id": job["id"], "nama": job["nama"],
                            "roadmap": job["roadmap"]})
    return jsonify({"detail": "Pekerjaan tidak ditemukan"}), 404


@app.post("/auth/register")
def auth_register():
    data = request.get_json(force=True, silent=True) or {}
    hasil, (pesan, status) = auth.register(data.get("name"),
                                           data.get("email"),
                                           data.get("password"))
    if pesan:
        return jsonify({"detail": pesan}), status
    return jsonify(hasil), status


@app.post("/auth/login")
def auth_login():
    data = request.get_json(force=True, silent=True) or {}
    hasil, (pesan, status) = auth.login(data.get("email"),
                                        data.get("password"))
    if pesan:
        return jsonify({"detail": pesan}), status
    return jsonify(hasil), status


@app.get("/auth/me")
def auth_me():
    user = _user_saat_ini()
    if not user:
        return jsonify({"detail": "Token tidak valid"}), 401
    return jsonify({"user": user})


@app.post("/auth/logout")
def auth_logout():
    ditolak = _butuh_login()
    if ditolak:
        return ditolak
    token = auth.token_dari_header(request.headers.get("Authorization", ""))
    hasil, (_, status) = auth.logout(token)
    return jsonify(hasil), status


@app.post("/rekomendasi")
def rekomendasi():
    """Hitung ranking rekomendasi karier dari skill + minat user.

    Membutuhkan login: header "Authorization: Bearer <token>".
    """
    ditolak = _butuh_login()
    if ditolak:
        return ditolak
    data = request.get_json(force=True, silent=True) or {}
    skills = data.get("skills", []) or []
    minat = data.get("minat", {}) or {}
    try:
        top_n = int(data.get("top_n", 5))
    except (TypeError, ValueError):
        top_n = 5
    top_n = max(1, min(top_n, 20))

    skill_user = {normalisasi(s) for s in skills
                  if isinstance(s, str) and s.strip()}
    max_gaji = max((p["gaji_max"] for p in PEKERJAAN), default=0)
    hasil = [hitung_skor(job, skill_user, minat, max_gaji)
             for job in PEKERJAAN]
    hasil.sort(key=lambda x: x["skor_akhir"], reverse=True)
    return jsonify({
        "hasil": hasil[:top_n],
        "metode": "Content-Based Filtering + Cosine Similarity + SAW",
    })


if __name__ == "__main__":
    app.run(debug=DEBUG, port=PORT)
