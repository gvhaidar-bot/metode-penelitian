#!/usr/bin/env python3
"""Pipeline dataset: Kaggle -> pekerjaan.json

Sumber:
  1. IT Jobs in Asia-Pacific (May-June 2024) — sergeychekurin (MIT)
     itjob_header.csv : jobid, country, level, specialisation, salary_from, ...
     itjob_main.csv   : jobid, title, source_classification
     itjob_tools.csv  : jobid, tool_text
     itjob_prog_lang.csv : jobid, prog_lang_text
     itjob_certification.csv : jobid, certification_text
  2. Indonesia Average Job Salary — husnind (CC BY 4.0)
     kolom: Judul Pekerjaan, Perusahaan, Lokasi, Gaji_Rata2 (IDR/bulan)

Langkah: unduh (butuh kredensial Kaggle) -> filter Indonesia -> kelompokkan
judul ke 10 karier -> agregasi skill -> gabung gaji -> tulis pekerjaan.json
+ ringkasan EDA.

Contoh:
    python3 build_dataset.py                      # pakai data/raw/*.csv bila ada
    python3 build_dataset.py --download            # unduh dulu via kaggle CLI
"""
import argparse
import re
import sys
from pathlib import Path

import pandas as pd

BASE = Path(__file__).parent
RAW = BASE / "raw"
OUT = BASE / "pekerjaan.json"

DS_JOBS = "sergeychekurin/it-jobs-in-asia-pacific-region-may-june-2024"
DS_SALARY = "husnind/indonesia-average-job-salary"

# Judul lowongan -> karier (dicek berurutan, yang spesifik dulu)
KARIER_RULES = [
    ("frontend-dev", ["front end", "frontend", "front-end"]),
    ("backend-dev", ["back end", "backend", "back-end"]),
    ("mobile-dev", ["mobile", "android", "ios", "flutter"]),
    ("data-analyst", ["data analyst"]),
    ("ml-engineer", ["machine learning", "ml engineer", "data scientist", "ai engineer", "artificial intelligence"]),
    ("uiux-designer", ["ui/ux", "ux designer", "ui designer", "product designer"]),
    ("devops-engineer", ["devops", "site reliability", "sre", "cloud engineer"]),
    ("security-analyst", ["security", "cyber", "information security"]),
    ("qa-engineer", ["quality assurance", "qa engineer", "test engineer", "software tester", " qa "]),
    ("it-pm", ["project manager", "product manager", "scrum master"]),
]

KATEGORI = {
    "frontend-dev": "Web", "backend-dev": "Web", "qa-engineer": "Web",
    "mobile-dev": "Mobile",
    "data-analyst": "Data & AI", "ml-engineer": "Data & AI",
    "uiux-designer": "Desain & Manajemen", "it-pm": "Desain & Manajemen",
    "devops-engineer": "Infrastruktur & Keamanan", "security-analyst": "Infrastruktur & Keamanan",
}

NAMA = {
    "frontend-dev": "Frontend Developer", "backend-dev": "Backend Developer",
    "mobile-dev": "Mobile Developer", "data-analyst": "Data Analyst",
    "ml-engineer": "Machine Learning Engineer", "uiux-designer": "UI/UX Designer",
    "devops-engineer": "DevOps Engineer", "security-analyst": "Cyber Security Analyst",
    "qa-engineer": "QA Engineer", "it-pm": "IT Project Manager",
}

# Roadmap knowledge-based (dari literatur) — tetap dipakai untuk tiap karier
ROADMAP_DEFAULT = {
    "frontend-dev": ["Kuasai HTML & CSS dasar", "Pelajari JavaScript (DOM, fetch, ES6+)", "Pelajari React", "Pelajari Tailwind CSS", "Pelajari Git & deployment", "Bangun portofolio"],
    "backend-dev": ["Kuasai Node.js atau Python", "Pelajari REST API & HTTP", "Pelajari database SQL", "Pelajari autentikasi (JWT)", "Pelajari Docker dasar", "Bangun API lengkap"],
    "mobile-dev": ["Pelajari Dart", "Pelajari Flutter", "Pelajari konsumsi REST API", "Pelajari Firebase", "Pelajari publish ke Play Store", "Bangun aplikasi portofolio"],
    "data-analyst": ["Kuasai Excel/Sheets", "Pelajari SQL", "Pelajari Python (pandas)", "Pelajari dasar Statistik", "Pelajari Tableau/Power BI", "Bangun dashboard portofolio"],
    "ml-engineer": ["Kuatkan Python & matematika", "Pelajari ML klasik (scikit-learn)", "Pelajari deep learning", "Pelajari MLOps dasar", "Ikuti kompetisi Kaggle", "Bangun project ML end-to-end"],
    "uiux-designer": ["Pelajari prinsip desain", "Kuasai Figma", "Pelajari UX research", "Pelajari prototyping", "Bangun studi kasus", "Pelajari design system"],
    "devops-engineer": ["Kuasai Linux & bash", "Pelajari Git & CI/CD", "Pelajari Docker", "Pelajari Kubernetes dasar", "Pelajari cloud (AWS/GCP)", "Bangun pipeline deployment"],
    "security-analyst": ["Pelajari jaringan komputer", "Kuasai Linux", "Pelajari Python untuk keamanan", "Pelajari SIEM", "Ikuti CTF / sertifikasi", "Bangun lab keamanan"],
    "qa-engineer": ["Pelajari konsep software testing", "Praktik testing manual", "Pelajari SQL", "Pelajari automation (Selenium)", "Pelajari API testing", "Bangun portofolio test plan"],
    "it-pm": ["Pahami Agile/Scrum", "Pelajari tools (Jira)", "Asah komunikasi & leadership", "Pelajari manajemen risiko", "Ambil sertifikasi (PSM/PMP)", "Pimpin project kecil"],
}


def unduh():
    """Unduh kedua dataset via kaggle CLI (butuh kredensial Kaggle)."""
    import shutil
    import subprocess
    if not shutil.which("kaggle"):
        sys.exit("kaggle CLI belum terinstal: pip install kaggle")
    RAW.mkdir(parents=True, exist_ok=True)
    for ds in (DS_JOBS, DS_SALARY):
        print(f"Mengunduh {ds} ...")
        r = subprocess.run(["kaggle", "datasets", "download", "-d", ds, "-p", str(RAW), "--unzip"],
                           capture_output=True, text=True)
        if r.returncode != 0:
            sys.exit(f"Gagal mengunduh {ds} (butuh login Kaggle):\n{r.stderr[-500:]}")
    print("Unduhan selesai.")


# Spesialisasi/teknologi -> karier (sinyal paling spesifik, dicek dulu)
SPEC_RULES = [
    ("frontend-dev", ["angular", "react", "vue", "frontend", "front end"]),
    ("mobile-dev", ["flutter", "android", "ios", "kotlin", "swift", "react native"]),
    ("data-analyst", ["data analysis", "big data", "data warehousing", "tableau", "power bi"]),
    ("ml-engineer", ["machine learning", "deep learning", "tensorflow", "pytorch", "data science"]),
    ("devops-engineer", ["devops", "kubernetes", "docker", "ci/cd", "aws", "azure", "cloud"]),
    ("security-analyst", ["cyber security", "information security", "soc ", "penetration"]),
    ("qa-engineer", ["qa", "quality assurance", "testing", "selenium", "test automation"]),
    ("it-pm", ["project management", "agile", "scrum", "product management"]),
    ("backend-dev", ["node.js", "node js", ".net", "java ", "python", "php", "golang", "backend", "back end", "api "]),
    ("uiux-designer", ["ui/ux", "ux design", "figma"]),
]

# Klasifikasi umum -> karier (fallback bila spesialisasi tidak cocok)
CLASS_RULES = [
    ("backend-dev", ["developers/programmers", "engineering - software", "architects"]),
    ("qa-engineer", ["testing & quality assurance"]),
    ("security-analyst", ["security"]),
    ("devops-engineer", ["networks & systems administration", "engineering - network"]),
    ("data-analyst", ["database development & administration", "business/systems analysts"]),
    ("it-pm", ["programme & project management", "management", "product management & development"]),
]

# Klasifikasi yang tidak dipetakan ke 10 karier (dikeluarkan dari agregasi)
SKIP_CLASS = ["help desk & it support", "sales - pre & post", "consultants"]


def norm_skill(s: str) -> str:
    s = re.sub(r"\s+", " ", str(s).strip())
    return s


def karier_dari_judul(judul: str):
    """Petakan judul lowongan (dataset gaji) ke karier via KARIER_RULES."""
    t = f" {judul.lower()} "
    for kid, keywords in KARIER_RULES:
        if any(k in t for k in keywords):
            return kid
    return None


def karier_dari_spesialisasi(teks: str):
    t = f" {teks.lower()} "
    for kid, keywords in SPEC_RULES:
        if any(k in t for k in keywords):
            return kid
    return None


def karier_dari_klasifikasi(klas: str):
    t = klas.lower().strip()
    if t in SKIP_CLASS:
        return None
    for kid, keywords in CLASS_RULES:
        if any(k in t for k in keywords):
            return kid
    return None


def proses_jobs():
    header = pd.read_csv(RAW / "itjob_header.csv", low_memory=False)
    main = pd.read_csv(RAW / "itjob_main.csv")
    tools = pd.read_csv(RAW / "itjob_tools.csv")
    prog = pd.read_csv(RAW / "itjob_prog_lang.csv")
    spec = pd.read_csv(RAW / "itjob_main_spec.csv")

    idn = header[header["country"].str.lower().str.strip() == "indonesia"].copy()
    print(f"Lowongan Indonesia: {len(idn)} dari {len(header)} total")

    df = idn.merge(main[["jobid", "source_classification"]], on="jobid", how="left")

    # gabung sinyal spesialisasi per jobid (dari header + tabel spec)
    spec_map = {}
    for _, r in spec.iterrows():
        spec_map.setdefault(r["jobid"], []).append(str(r["addit_spec_text"]))
    df["spec_text"] = df["jobid"].map(lambda j: " ".join(spec_map.get(j, [])))
    df["tech_spec"] = df["tech_specialisation"].fillna("") if "tech_specialisation" in df.columns else ""

    def petakan(r):
        kid = karier_dari_spesialisasi(f"{r['spec_text']} {r['tech_spec']}")
        if kid:
            return kid
        return karier_dari_klasifikasi(str(r["source_classification"] or ""))

    df["karier"] = df.apply(petakan, axis=1)
    n_sebelum_peta = len(df)
    df = df[df["karier"].notna()].copy()
    print(f"Lowongan terpetakan ke karier: {len(df)}")

    skill_map = {}
    for _, r in tools.iterrows():
        s = norm_skill(r["tool_text"])
        if s:
            skill_map.setdefault(r["jobid"], []).append(s)
    for _, r in prog.iterrows():
        s = norm_skill(r["prog_lang_text"])
        if s:
            skill_map.setdefault(r["jobid"], []).append(s)
    df["skills"] = df["jobid"].map(lambda j: skill_map.get(j, []))

    return df, n_sebelum_peta


def proses_gaji(df_jobs):
    """Median gaji per karier dari dataset JobStreet (dalam juta IDR)."""
    hasil = {}
    f = RAW / "indonesia-average-job-salary.csv"
    if not f.exists():
        # cari file csv gaji apa pun di raw/
        kandidat = [p for p in RAW.glob("*.csv") if "itjob" not in p.name]
        f = kandidat[0] if kandidat else None
    if f is None:
        print("File gaji tidak ditemukan — pakai estimasi default.")
        return hasil
    sal = pd.read_csv(f)
    kolom_judul = next((c for c in sal.columns if "judul" in c.lower()), sal.columns[0])
    kolom_gaji = next((c for c in sal.columns if "gaji" in c.lower()), sal.columns[-1])
    sal["karier"] = sal[kolom_judul].fillna("").apply(karier_dari_judul)
    sal = sal[sal["karier"].notna()].copy()
    sal[kolom_gaji] = pd.to_numeric(sal[kolom_gaji], errors="coerce")
    for kid, g in sal.groupby("karier"):
        q = g[kolom_gaji].quantile([0.25, 0.75]) / 1_000_000
        hasil[kid] = (round(float(q.iloc[0]), 1), round(float(q.iloc[1]), 1))
    print(f"Gaji terpetakan untuk {len(hasil)} karier dari {len(sal)} baris")
    return hasil


def bangun(df, gaji_map):
    data = []
    # Hitung jumlah lowongan per karier dulu untuk normalisasi demand
    counts = {kid: len(df[df["karier"] == kid]) for kid in NAMA}
    max_count = max(counts.values()) if counts else 1
    for kid in NAMA:
        sub = df[df["karier"] == kid]
        if sub.empty:
            continue
        # skill: 12 paling sering muncul
        counter = {}
        for skills in sub["skills"]:
            for s in skills:
                if s:
                    counter[s] = counter.get(s, 0) + 1
        top_skills = [s for s, _ in sorted(counter.items(), key=lambda x: -x[1])[:12]]

        # demand: max-normalization jumlah lowongan ke skala 1-5.
        # Konsisten dengan normalisasi SAW untuk kriteria benefit (x/max),
        # sehingga skor_demand = demand/5 = proporsi thd karier terbanyak.
        demand = max(1, round(5 * len(sub) / max_count))
        gmin, gmax = gaji_map.get(kid, (5.0, 12.0))

        data.append({
            "id": kid,
            "nama": NAMA[kid],
            "kategori": KATEGORI[kid],
            "skills": top_skills,
            "roadmap": ROADMAP_DEFAULT[kid],
            "gaji_min": gmin,
            "gaji_max": gmax,
            "demand": demand,
        })
    return data


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--download", action="store_true", help="Unduh dataset via kaggle CLI dulu")
    args = ap.parse_args()

    if args.download or not (RAW / "itjob_header.csv").exists():
        if args.download:
            unduh()
        else:
            sys.exit(
                "File mentah tidak ditemukan di backend/data/raw/.\n"
                "Jalankan: python3 build_dataset.py --download  (butuh kredensial Kaggle)\n"
                "atau taruh CSV Kaggle manual di folder tersebut."
            )

    df, n_indonesia = proses_jobs()
    gaji_map = proses_gaji(df)
    data = bangun(df, gaji_map)

    OUT.write_text(__import__("json").dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nDitulis: {OUT} ({len(data)} karier)")

    # Ringkasan EDA
    print("\n=== Ringkasan EDA ===")
    vc = df["karier"].value_counts()
    print(vc.to_string())
    print("\nContoh skill per karier:")
    contoh = []
    for d in data[:3]:
        contoh.append(f"- {d['nama']}: {', '.join(d['skills'][:6])}")
        print(contoh[-1])

    # simpan ringkasan untuk laporan
    baris = ["# Ringkasan EDA — Dataset Karier IT Indonesia", "",
             f"Dibuat: {__import__('datetime').date.today().isoformat()}",
             f"Sumber: IT Jobs Asia-Pacific (May–Jun 2024) + JobStreet Salary 2024", "",
             f"- Total lowongan: {len(pd.read_csv(RAW / 'itjob_header.csv', usecols=['jobid']))}",
             f"- Lowongan Indonesia: {n_indonesia} (sebelum pemetaan karier)",
             f"- Terpetakan ke 10 karier: {len(df)}",
             f"- Karier dengan data gaji: {len(gaji_map)} dari 10", "",
             "## Distribusi lowongan per karier", ""]
    baris += [f"- {NAMA[k]}: {v}" for k, v in vc.items()]
    baris += ["", "## Contoh skill tersering", ""] + contoh
    (BASE / "eda_summary.md").write_text("\n".join(baris), encoding="utf-8")
    print(f"\nRingkasan tersimpan: {BASE / 'eda_summary.md'}")


if __name__ == "__main__":
    main()
