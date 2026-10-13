"""Akses data lowongan Glints (backend/data/glints_jobs.csv).

File CSV diklaim tim sebagai 1.133 lowongan Glints Indonesia Mei-Jun 2026
(commit 211db6f5). Kolom posted_date hanya berisi tanggal relatif
("Kemarin", "N hari yang lalu") sehingga klaim tahun tidak bisa
diverifikasi dari isi file — lihat docs/integrasi-glints.md.
"""
import csv
import os
import re

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
CSV_PATH = os.path.join(DATA_DIR, "glints_jobs.csv")

# Kata kunci judul lowongan -> id karier di pekerjaan.json.
# Urutan penting: pola yang lebih spesifik dicek lebih dulu.
PEMETAAN_JUDUL = [
    ("frontend-dev", [r"front[\s-]?end", r"\breact\b", r"\bvue\b", r"angular"]),
    ("backend-dev", [r"back[\s-]?end", "golang", "laravel", r"node\.?js", r"\.net\b", "django", "spring boot"]),
    ("mobile-dev", [r"\bmobile\b", "android", r"\bios\b", "flutter", "react native", "kotlin", "swift"]),
    ("data-analyst", ["data analyst", "data analis", "business intelligence", r"\bbi\b"]),
    ("ml-engineer", ["machine learning", r"\bml\b", "ai engineer", "data scientist", "deep learning"]),
    ("devops-engineer", ["devops", "site reliability", r"\bsre\b", "cloud engineer"]),
    ("security-analyst", ["cyber", "information security", "penetration", "soc analyst"]),
    ("qa-engineer", ["quality assurance", "software tester", "test engineer", r"\bqa\b"]),
    ("uiux-designer", ["ui/ux", "ui ux", "product designer", "ux designer", "ui designer"]),
    ("it-pm", ["project manager", "product manager", "scrum master"]),
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


_cache = None


def muat_lowongan():
    """Baca CSV sekali lalu cache. Tiap item: dict + karier_id + gaji_min/max."""
    global _cache
    if _cache is not None:
        return _cache
    hasil = []
    if not os.path.exists(CSV_PATH):
        _cache = hasil
        return hasil
    with open(CSV_PATH, encoding="utf-8-sig", newline="") as f:
        for baris in csv.DictReader(f):
            gmin, gmax = parse_gaji(baris.get("salary_range", ""))
            hasil.append({
                "judul": (baris.get("job_title") or "").strip(),
                "perusahaan": (baris.get("company_name") or "").strip(),
                "lokasi": (baris.get("location") or "").strip(),
                "gaji": (baris.get("salary_range") or "").replace("\xa0", " ").strip(),
                "gaji_min": gmin,
                "gaji_max": gmax,
                "tipe": (baris.get("job_type") or "").strip(),
                "pengalaman": (baris.get("experience_level") or "").strip(),
                "karier_id": petakan_karier(baris.get("job_title"), baris.get("job_requirements")),
            })
    _cache = hasil
    return hasil


def lowongan_untuk_karier(karier_id, batas=5):
    """Ambil lowongan yang terpetakan ke satu karier (maksimal `batas`)."""
    semua = [l for l in muat_lowongan() if l["karier_id"] == karier_id]
    return semua[:batas], len(semua)
