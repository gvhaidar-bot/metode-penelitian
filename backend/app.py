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
import re
import time
from pathlib import Path

from flask import Flask, jsonify, request
from flask_cors import CORS

import auth
import glints

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


def tokenisasi(skill: str) -> set:
    """Pecah satu nama skill menjadi token: 'HTML/CSS' -> {'html', 'css'}.

    Menangani inkonsistensi penulisan data ('HTML/CSS' di satu profil
    vs 'HTML' + 'CSS' di profil lain) agar pencocokan adil, serta
    menormalkan istilah Bahasa Indonesia ke Bahasa Inggris
    ('ui desain' -> 'ui design') karena profil karier memakai istilah
    Inggris. Normalisasi ini preprocessing CBF, bukan metode baru.
    """
    s = _terapkan_sinonim(str(skill).lower())
    return {_urutkan_kata(t) for t in (p.strip() for p in s.split("/")) if t}


# Kamus sinonim Indonesia -> Inggris untuk normalisasi token skill.
# Diterapkan simetris ke skill user dan skill profil karier.
SINONIM_ID_EN = {
    # Frasa multi-kata (dicocokkan dulu sebelum kata tunggal).
    "kecerdasan buatan": "artificial intelligence",
    "pembelajaran mesin": "machine learning",
    "sistem operasi": "operating system",
    "basis data": "database",
    "perangkat lunak": "software",
    "perangkat keras": "hardware",
    "ilmu data": "data science",
    "sumber daya manusia": "human resource",
    # Kata tunggal.
    "desain": "design",
    "jaringan": "network",
    "networking": "network",
    "keamanan": "security",
    "siber": "cyber",
    "pengujian": "testing",
    "grafis": "graphic",
    "pemrograman": "programming",
    "analisis": "analysis",
    "analisa": "analysis",
    "awan": "cloud",
    "komputasi": "computing",
    "komputer": "computer",
    "sistem": "system",
    "manajemen": "management",
    "proyek": "project",
    "dukungan": "support",
    "teknis": "technical",
    "pengembangan": "development",
    "aplikasi": "application",
    "seluler": "mobile",
    "buatan": "artificial",
    "rekayasa": "engineering",
    "komunikasi": "communication",
    "dokumentasi": "documentation",
    "perangkat": "device",
}


def _terapkan_sinonim(teks: str) -> str:
    """Ganti istilah Indonesia dengan padanan Inggris (batas kata penuh).

    Frasa multi-kata diproses dulu agar 'basis data' menjadi 'database',
    bukan 'basis database'. Kata-kata dalam tiap token lalu diurutkan
    alfabetis agar 'desain ui' cocok dengan 'ui design'.
    """
    for frasa in sorted(SINONIM_ID_EN, key=lambda k: -len(k.split())):
        teks = re.sub(r"\b" + re.escape(frasa) + r"\b",
                      SINONIM_ID_EN[frasa], teks)
    return teks


def _urutkan_kata(token: str) -> str:
    """Urutkan kata dalam token: 'ui design' dan 'design ui' jadi sama."""
    kata = token.split()
    return " ".join(sorted(kata)) if len(kata) > 1 else token


def token_skill(daftar) -> set:
    """Gabungan token dari sekumpulan nama skill."""
    token = set()
    for s in daftar:
        token |= tokenisasi(s)
    return token


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


def bobot_roc(urutan):
    """Konversi ranking kategori (paling diminati dulu) menjadi bobot
    yang totalnya 1, dipakai sebagai skor kriteria "minat" dalam SAW.

    Ini BUKAN metode baru: SAW membutuhkan bobot/nilai tiap kriteria,
    dan urutan prioritas user diubah ke bobot memakai Rank Order
    Centroid (Barron & Barrett), teknik pembobotan standar untuk
    mengubah ranking ordinal menjadi bobot kardinal:
        w_i = (1/n) * sum(1/k untuk k = i..n)
    Metode penelitian tetap: Content-Based Filtering + SAW.
    """
    n = len(urutan)
    bobot = {}
    for i, kat in enumerate(urutan):
        w = sum(1.0 / k for k in range(i + 1, n + 1)) / n
        bobot[str(kat).strip().lower()] = w
    return bobot


def hitung_skor(job: dict, skill_user: set, minat: list, max_gaji: float) -> dict:
    # Pencocokan memakai token (lihat tokenisasi) agar 'HTML/CSS'
    # tetap cocok dengan 'HTML' + 'CSS'.
    token_user = token_skill(skill_user)
    token_job = token_skill(job["skills"])
    # Petakan token ke penulisan asli untuk tampilan.
    asli_job = {}
    for s in job["skills"]:
        for t in tokenisasi(s):
            asli_job.setdefault(t, s)

    # Minat diinput sebagai ranking 5 kategori (tanpa angka), lalu
    # dikonversi ke bobot via Rank Order Centroid.
    bobot_minat = bobot_roc(minat or [])
    skor_minat = bobot_minat.get(job["kategori"].strip().lower(), 0.0)

    skor_skill = cosine_similarity(token_user, token_job)
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

    cocok = sorted({asli_job[t] for t in token_user & token_job})
    kurang = sorted({asli_job[t] for t in token_job - token_user})

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
        # Info ketahanan terhadap AI: hanya informasi tampilan,
        # TIDAK ikut perhitungan CBF+SAW.
        "ai_risk": job.get("ai_risk", {"level": "-", "alasan": ""}),
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


@app.get("/pekerjaan/<pekerjaan_id>/lowongan")
def lowongan_pekerjaan(pekerjaan_id: str):
    """Contoh lowongan Glints yang terpetakan ke satu pekerjaan."""
    if not any(job["id"] == pekerjaan_id for job in PEKERJAAN):
        return jsonify({"detail": "Pekerjaan tidak ditemukan"}), 404
    contoh, total = glints.lowongan_untuk_karier(pekerjaan_id, batas=5)
    for l in contoh:
        l.pop("karier_id", None)
    return jsonify({
        "id": pekerjaan_id,
        "total_terpetakan": total,
        "sumber": "Glints Indonesia (Mei-Jun 2026, klaim tim — posted_date relatif)",
        "lowongan": contoh,
    })


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
    """Hitung ranking rekomendasi karier dari skill + ranking minat user.

    Membutuhkan login: header "Authorization: Bearer <token>".
    Body: {"skills": [...], "minat": [kategori...], "top_n": 5}.
    "minat" adalah daftar 5 kategori terurut dari yang paling diminati
    (tanpa angka); backend mengonversinya ke bobot via Rank Order Centroid.
    Bila "skills" kosong, dipakai skill tersimpan di profil akun.
    Hasil otomatis tersimpan di riwayat akun.
    """
    ditolak = _butuh_login()
    if ditolak:
        return ditolak
    user = _user_saat_ini()
    data = request.get_json(force=True, silent=True) or {}
    skills = data.get("skills", []) or []
    if not skills:
        profil = auth.get_profil(user["email"]) or {}
        skills = profil.get("skills", [])
    minat = data.get("minat", []) or []
    try:
        top_n = int(data.get("top_n", 5))
    except (TypeError, ValueError):
        top_n = 5
    top_n = max(1, min(top_n, 20))

    kategori_valid = sorted({j["kategori"].strip().lower()
                             for j in PEKERJAAN})
    minat_norm = [str(k).strip().lower() for k in minat
                  if isinstance(k, str) and str(k).strip()]
    if sorted(minat_norm) != kategori_valid:
        return jsonify({"detail": "Urutkan kelima kategori minat dari yang paling diminati"}), 400

    skill_user = {normalisasi(s) for s in skills
                  if isinstance(s, str) and s.strip()}
    if not skill_user:
        return jsonify({"detail": "Isi dulu skill di halaman Skill Saya"}), 400
    max_gaji = max((p["gaji_max"] for p in PEKERJAAN), default=0)
    hasil = [hitung_skor(job, skill_user, minat_norm, max_gaji)
             for job in PEKERJAAN]
    hasil.sort(key=lambda x: x["skor_akhir"], reverse=True)

    auth.tambah_riwayat(user["email"], {
        "waktu": time.strftime("%Y-%m-%d %H:%M:%S"),
        "skills": sorted(skill_user),
        "minat": minat_norm,
        "hasil": [{"id": h["id"], "nama": h["nama"],
                   "skor_akhir": h["skor_akhir"]} for h in hasil[:top_n]],
    })
    return jsonify({
        "hasil": hasil[:top_n],
        "metode": "Content-Based Filtering + Cosine Similarity + SAW",
    })


@app.get("/profil")
def profil_get():
    """Profil akun: nama, email, dan skill tersimpan."""
    ditolak = _butuh_login()
    if ditolak:
        return ditolak
    return jsonify(auth.get_profil(_user_saat_ini()["email"]))


@app.put("/profil")
def profil_put():
    """Simpan daftar skill akun. Skill bebas diajukan user (maks 40 karakter)."""
    ditolak = _butuh_login()
    if ditolak:
        return ditolak
    data = request.get_json(force=True, silent=True) or {}
    ok, pesan = auth.simpan_skills(_user_saat_ini()["email"],
                                   data.get("skills", []))
    if not ok:
        return jsonify({"detail": pesan}), 400
    return jsonify(auth.get_profil(_user_saat_ini()["email"]))


@app.get("/skills")
def daftar_skills():
    """Daftar skill master (dari profil karier) untuk kolom pencarian.

    Query opsional: ?q=teks untuk filter.
    """
    q = (request.args.get("q", "") or "").strip().lower()
    semua = sorted({s for job in PEKERJAAN for s in job["skills"]},
                   key=str.lower)
    if q:
        # Pencarian sadar sinonim: "desain" menemukan "UI Design".
        qn = _terapkan_sinonim(q)
        semua = [s for s in semua if qn in _terapkan_sinonim(s.lower())]
    return jsonify({"skills": semua, "jumlah": len(semua)})


@app.get("/quest")
def quest_get():
    """Progress quest roadmap per karier untuk akun ini."""
    ditolak = _butuh_login()
    if ditolak:
        return ditolak
    quests = auth.get_quests(_user_saat_ini()["email"])
    hasil = {}
    for job in PEKERJAAN:
        selesai = sorted(quests.get(job["id"], []))
        total = len(job.get("roadmap", []))
        hasil[job["id"]] = {
            "selesai": selesai,
            "total": total,
            "persen": round(len(selesai) / total * 100) if total else 0,
        }
    return jsonify(hasil)


@app.post("/quest")
def quest_set():
    """Tandai satu langkah roadmap selesai/belum.

    Body: {"karier_id": "...", "langkah": 0, "selesai": true}.
    """
    ditolak = _butuh_login()
    if ditolak:
        return ditolak
    data = request.get_json(force=True, silent=True) or {}
    karier_id = data.get("karier_id", "")
    job = next((j for j in PEKERJAAN if j["id"] == karier_id), None)
    if not job:
        return jsonify({"detail": "Karier tidak ditemukan"}), 404
    try:
        langkah = int(data.get("langkah"))
    except (TypeError, ValueError):
        return jsonify({"detail": "Nomor langkah tidak valid"}), 400
    if not 0 <= langkah < len(job.get("roadmap", [])):
        return jsonify({"detail": "Nomor langkah di luar jangkauan"}), 400
    ok, pesan = auth.set_quest(_user_saat_ini()["email"], karier_id,
                               langkah, bool(data.get("selesai")))
    if not ok:
        return jsonify({"detail": pesan}), 400
    return jsonify({"ok": True})


@app.get("/riwayat")
def riwayat_get():
    """Riwayat rekomendasi milik akun ini (terbaru dulu)."""
    ditolak = _butuh_login()
    if ditolak:
        return ditolak
    return jsonify({"riwayat": auth.get_riwayat(_user_saat_ini()["email"])})


if __name__ == "__main__":
    app.run(debug=DEBUG, port=PORT)
