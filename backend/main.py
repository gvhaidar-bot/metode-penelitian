"""Backend API Sistem Rekomendasi Karier IT.

Metode:
  1. Content-Based Filtering + Cosine Similarity  -> kecocokan skill user
     terhadap profil skill tiap pekerjaan.
  2. SAW (Simple Additive Weighting)             -> gabungan skor akhir dari
     kecocokan skill, minat, gaji, dan kebutuhan pasar (demand).

Jalankan:  uvicorn main:app --reload   (dari folder backend/)
Dokumen API otomatis: http://localhost:8000/docs
"""
import json
import math
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="API Rekomendasi Karier IT")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_PATH = Path(__file__).parent / "data" / "pekerjaan.json"
PEKERJAAN = json.loads(DATA_PATH.read_text(encoding="utf-8"))

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

    skor_skill = cosine_similarity(skill_user, skills_job)
    skor_minat = minat.get(job["kategori"], 3) / 5.0
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


class RekomendasiIn(BaseModel):
    skills: list[str] = Field(default_factory=list, description="Daftar skill yang dimiliki user")
    minat: dict[str, int] = Field(default_factory=dict, description="Nilai minat 1-5 per kategori")
    top_n: int = Field(default=5, ge=1, le=20)


@app.get("/")
def root():
    return {"status": "ok", "service": "API Rekomendasi Karier IT"}


@app.get("/pekerjaan")
def daftar_pekerjaan():
    """Daftar semua profil pekerjaan."""
    return PEKERJAAN


@app.get("/pekerjaan/{pekerjaan_id}")
def detail_pekerjaan(pekerjaan_id: str):
    for job in PEKERJAAN:
        if job["id"] == pekerjaan_id:
            return job
    raise HTTPException(status_code=404, detail="Pekerjaan tidak ditemukan")


@app.post("/rekomendasi")
def rekomendasi(inp: RekomendasiIn):
    """Hitung ranking rekomendasi karier dari skill + minat user."""
    skill_user = {normalisasi(s) for s in inp.skills if s.strip()}
    hasil = [hitung_skor(job, skill_user, inp.minat) for job in PEKERJAAN]
    hasil.sort(key=lambda x: x["skor_akhir"], reverse=True)
    return {"hasil": hasil[: inp.top_n], "metode": "Content-Based Filtering + Cosine Similarity + SAW"}
