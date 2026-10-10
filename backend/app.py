"""Backend API Sistem Rekomendasi Karier IT (Flask).

Metode:
  1. Content-Based Filtering + Cosine Similarity  -> kecocokan skill user
     terhadap profil skill tiap pekerjaan.
  2. SAW (Simple Additive Weighting)             -> gabungan skor akhir dari
     kecocokan skill, minat, gaji, dan kebutuhan pasar (demand).

Jalankan (dari folder backend/):
    flask --app app run --debug
atau:
    python app.py
"""
import json
import math
from pathlib import Path

from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # izinkan akses dari frontend (Vite)

DATA_PATH = Path(__file__).parent / "data" / "pekerjaan.json"
PEKERJAAN = json.loads(DATA_PATH.read_text(encoding="utf-8"))

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
    print(f"[app] Lewati PostgreSQL ({e}); memakai pekerjaan.json")

# Bobot SAW: skill 45%, minat 25%, gaji 15%, demand 15%
BOBOT = {"skill": 0.45, "minat": 0.25, "gaji": 0.15, "demand": 0.15}
MAX_GAJI = max(p["gaji_max"] for p in PEKERJAAN)


def normalisasi(skill: str) -> str:
    return skill.strip().lower()


def cosine_similarity(skill_user: set, skill_job: set) -> float:
    """Cosine similarity antara himpunan skill user dan skill pekerjaan."""
    if not skill_user or not skill_job:
        return 0.0
    irisan = len(skill_user & skill_job)
    return irisan / (math.sqrt(len(skill_user)) * math.sqrt(len(skill_job)))


def hitung_skor(job: dict, skill_user: set, minat: dict) -> dict:
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
    # Normalisasi SAW baku untuk kriteria benefit: x / max(x)
    skor_gaji = job["gaji_max"] / MAX_GAJI
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


@app.get("/")
def root():
    return jsonify({"status": "ok", "service": "API Rekomendasi Karier IT"})


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
            return jsonify({"id": job["id"], "nama": job["nama"], "roadmap": job["roadmap"]})
    return jsonify({"detail": "Pekerjaan tidak ditemukan"}), 404


@app.post("/rekomendasi")
def rekomendasi():
    """Hitung ranking rekomendasi karier dari skill + minat user."""
    data = request.get_json(force=True, silent=True) or {}
    skills = data.get("skills", []) or []
    minat = data.get("minat", {}) or {}
    try:
        top_n = int(data.get("top_n", 5))
    except (TypeError, ValueError):
        top_n = 5
    top_n = max(1, min(top_n, 20))

    skill_user = {normalisasi(s) for s in skills if isinstance(s, str) and s.strip()}
    hasil = [hitung_skor(job, skill_user, minat) for job in PEKERJAAN]
    hasil.sort(key=lambda x: x["skor_akhir"], reverse=True)
    return jsonify({
        "hasil": hasil[:top_n],
        "metode": "Content-Based Filtering + Cosine Similarity + SAW",
    })


if __name__ == "__main__":
    app.run(debug=True, port=8000)
