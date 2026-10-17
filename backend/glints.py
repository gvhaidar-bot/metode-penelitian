"""Akses data lowongan Glints dari tabel ``lowongan_glints`` di PostgreSQL.

Sumber dataset: backend/data/glints_jobs.csv (1.133 lowongan Glints
Indonesia, diklaim tim Mei-Jun 2026) yang diimpor ke database lewat
``impor_csv_ke_db()`` / backend/data/load_glints.py. File CSV tidak
dibaca aplikasi saat berjalan. Kolom posted_date CSV hanya berisi
tanggal relatif ("Kemarin", "N hari yang lalu") sehingga klaim tahun
tidak bisa diverifikasi dari isi file — lihat docs/integrasi-glints.md.
"""
import csv
import os
import re

from db import LowonganGlints, sesi_db

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
CSV_PATH = os.path.join(DATA_DIR, "glints_jobs.csv")

# Kata kunci judul lowongan -> id karier di pekerjaan.json.
# Urutan penting: pola yang lebih spesifik dicek lebih dulu.
PEMETAAN_JUDUL = [
    ("frontend-dev", [r"front[\s-]?end", r"\breact\b", r"\bvue\b", r"angular", "web developer", "wordpress"]),
    ("backend-dev", [r"back[\s-]?end", "golang", "laravel", r"node\.?js", r"\.net\b", "django", "spring boot"]),
    ("mobile-dev", [r"\bmobile\b", "android", r"\bios\b", "flutter", "react native", "kotlin", "swift"]),
    ("data-analyst", ["data analyst", "data analis", "business intelligence", r"\bbi\b"]),
    ("data-engineer", ["data engineer", "etl developer", "data pipeline"]),
    ("business-analyst", ["business analyst", "business analis", r"\bba\b analyst"]),
    ("system-analyst", ["system analyst", "systems analyst", "analis sistem"]),
    ("fullstack-dev", ["full stack", "fullstack", "full-stack"]),
    ("ml-engineer", ["machine learning", r"\bml\b", "ai engineer", "deep learning"]),
    ("devops-engineer", ["devops", "site reliability", r"\bsre\b"]),
    ("cloud-engineer", ["cloud engineer", "cloud architect", "cloud specialist"]),
    ("network-engineer", ["network engineer", "network administrator", "teknisi jaringan"]),
    ("sysadmin", ["system administrator", "sysadmin", r"\bit administrator\b"]),
    ("game-developer", ["game developer", "game programmer", "unity developer"]),
    ("dba", ["database administrator", r"\bdba\b"]),
    ("data-scientist", ["data scientist", "data science"]),
    ("product-manager", ["product manager", "product owner"]),
    ("it-support", ["it support", "helpdesk", "technical support"]),
    ("embedded-engineer", ["embedded", "firmware engineer", "iot engineer"]),
    ("security-analyst", ["cyber", "information security", "penetration", "soc analyst"]),
    ("qa-engineer", ["quality assurance", "software tester", "test engineer", r"\bqa\b"]),
    ("uiux-designer", ["ui/ux", "ui ux", "product designer", "ux designer", "ui designer"]),
    ("it-pm", ["project manager", "scrum master", "project coordinator"]),
]

# Untuk judul generik ("Software Engineer"), tebak dari skill di requirements.
PETUNJUK_SKILL = [
    ("frontend-dev", [r"\breact\b", r"\bvue\b", "angular", "javascript", "typescript"]),
    ("mobile-dev", ["flutter", "kotlin", "swift", r"\bandroid\b", r"\bios\b", "react native"]),
    ("backend-dev", ["laravel", "golang", r"\bnode\b", r"\bjava\b", r"\bphp\b", "django", r"\.net\b", "postgresql", r"\bmysql\b"]),
    ("data-analyst", [r"\bsql\b", "tableau", "power bi", "excel", "looker"]),
    ("ml-engineer", ["tensorflow", "pytorch", "machine learning", "scikit"]),
    ("devops-engineer", ["docker", "kubernetes", "jenkins", "aws", "gcp", "terraform"]),
    ("security-analyst", ["penetration", "burp", "owasp", "soc"]),
    ("qa-engineer", ["selenium", "cypress", "postman", "katalon", "testing"]),
    ("uiux-designer", ["figma", "adobe xd", "wireframe", "prototype"]),
]


def _cocok(teks, pola_list):
    teks = (teks or "").lower()
    return any(re.search(p, teks) for p in pola_list)


def petakan_karier(judul, requirements=""):
    """Kembalikan id karier atau None bila tidak cocok."""
    for karier_id, pola in PEMETAAN_JUDUL:
        if _cocok(judul, pola):
            return karier_id
    for karier_id, pola in PETUNJUK_SKILL:
        if _cocok(requirements, pola):
            return karier_id
    return None


def parse_gaji(teks):
    """'Rp 5 jt-7 jt' -> (5.0, 7.0). 'Gaji Tidak Ditampilkan' -> (None, None)."""
    if not teks or "tidak ditampilkan" in teks.lower():
        return None, None
    angka = re.findall(r"\d+(?:[.,]\d+)?", teks.replace("\xa0", " "))
    if len(angka) >= 2:
        return float(angka[0].replace(",", ".")), float(angka[1].replace(",", "."))
    return None, None


def _ke_dict(row):
    return {
        "judul": row.judul,
        "perusahaan": row.perusahaan,
        "lokasi": row.lokasi,
        "gaji": row.gaji_teks,
        "gaji_min": float(row.gaji_min) if row.gaji_min is not None else None,
        "gaji_max": float(row.gaji_max) if row.gaji_max is not None else None,
        "tipe": row.tipe,
        "pengalaman": row.pengalaman,
        "karier_id": row.karier_id,
    }


def muat_lowongan():
    """Seluruh lowongan dari database. Tiap item: dict + karier_id + gaji_min/max."""
    try:
        with sesi_db() as s:
            return [_ke_dict(r) for r in s.query(LowonganGlints).order_by(LowonganGlints.id)]
    except Exception:
        return []


def lowongan_untuk_karier(karier_id, batas=5):
    """Ambil lowongan yang terpetakan ke satu karier (maksimal `batas`)."""
    try:
        with sesi_db() as s:
            total = s.query(LowonganGlints).filter_by(karier_id=karier_id).count()
            rows = (s.query(LowonganGlints).filter_by(karier_id=karier_id)
                    .order_by(LowonganGlints.id).limit(batas))
            return [_ke_dict(r) for r in rows], total
    except Exception:
        return [], 0


def impor_csv_ke_db():
    """Impor ulang glints_jobs.csv ke tabel lowongan_glints (hapus + isi ulang).

    Kembalikan (total, terpetakan, tak_terpetakan). Jalankan setelah
    schema.sql + seed.sql (karier harus sudah ada untuk FK).
    """
    with open(CSV_PATH, encoding="utf-8-sig", newline="") as f:
        baris_csv = list(csv.DictReader(f))
    total = len(baris_csv)
    terpetakan = 0
    with sesi_db() as s:
        s.query(LowonganGlints).delete()
        for baris in baris_csv:
            gmin, gmax = parse_gaji(baris.get("salary_range", ""))
            karier_id = petakan_karier(baris.get("job_title"),
                                        baris.get("job_requirements"))
            if karier_id:
                terpetakan += 1
            s.add(LowonganGlints(
                karier_id=karier_id,
                judul=(baris.get("job_title") or "").strip(),
                perusahaan=(baris.get("company_name") or "").strip(),
                lokasi=(baris.get("location") or "").strip(),
                gaji_teks=(baris.get("salary_range") or "").replace("\xa0", " ").strip(),
                gaji_min=gmin,
                gaji_max=gmax,
                tipe=(baris.get("job_type") or "").strip(),
                pengalaman=(baris.get("experience_level") or "").strip(),
            ))
        s.commit()
    return total, terpetakan, total - terpetakan
