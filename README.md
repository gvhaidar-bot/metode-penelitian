# Sistem Rekomendasi Karier Mahasiswa Informatika

![Python](https://img.shields.io/badge/Python-3.10%2B-blue)
![Flask](https://img.shields.io/badge/Flask-3.x-black)
![React](https://img.shields.io/badge/React-19-61dafb)
![Vite](https://img.shields.io/badge/Vite-8-646cff)
![Metode](https://img.shields.io/badge/Metode-CBF%20%2B%20SAW-green)

Web app Sistem Pendukung Keputusan (SPK) untuk rekomendasi bidang karier
mahasiswa Informatika. Pengguna memasukkan skill yang dikuasai dan menilai
minatnya, sistem mencocokkan dengan profil 10 bidang pekerjaan IT lalu
mengeluarkan ranking karier, roadmap belajar, dan info prospek (gaji,
kebutuhan pasar).

Judul penelitian: *Rancang Bangun Sistem Pendukung Keputusan Rekomendasi
Karier Mahasiswa Informatika Berbasis Web Menggunakan Metode Content-Based
Filtering dan Simple Additive Weighting (SAW)*.

## Fitur

- Register/login/logout dengan token (password di-hash)
- Rekomendasi karier berbasis skill + minat (wizard 3 langkah)
- Ranking 5 karier teratas + skor kecocokan per kriteria
- Roadmap belajar tiap bidang karier
- Riwayat rekomendasi (tersimpan di browser)
- Proteksi route: halaman dalam hanya bisa diakses setelah login

## Metode

1. **Content-Based Filtering + Cosine Similarity** — mencocokkan vektor
   skill pengguna dengan vektor skill tiap pekerjaan.
2. **SAW (Simple Additive Weighting)** — merangking hasil dari 4 kriteria:
   kecocokan skill (bobot 0,4), minat (0,3), gaji (0,2), kebutuhan pasar
   (0,1). Bobot tersimpan di `backend/data/bobot.json` sehingga mudah
   diubah tanpa menyentuh kode.

Simulasi perhitungan manual: `docs/contoh-perhitungan.md`.

## Struktur repo

```
metode-penelitian/
├── backend/
│   ├── app.py              # Flask REST API (auth, rekomendasi, pekerjaan)
│   ├── auth.py             # register/login/logout + token
│   ├── db.py               # akses data (PostgreSQL / fallback JSON)
│   ├── data/
│   │   ├── pekerjaan.json  # 10 profil karier (skill, gaji, demand, roadmap)
│   │   ├── bobot.json      # bobot kriteria SAW
│   │   ├── job_salary_mean.csv                      # dataset gaji (mentah)
│   │   ├── lowongan_data_dan_analytics_jobstreet.csv # lowongan JobStreet (mentah)
│   │   └── glints_jobs.csv                          # lowongan Glints (mentah)
│   ├── tests/test_api.py   # test otomatis (pytest, 14 test)
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── pages/          # Home (auth), Dashboard, Rekomendasi,
│       │                   # Roadmap, Riwayat
│       ├── components/Sidebar.jsx
│       ├── auth.jsx        # context auth + ProtectedRoute
│       └── api.js          # pemanggil REST API
├── docs/                   # dokumen penelitian
└── rencana-project.md      # rencana awal project
```

## Dataset

Profil 10 karier di `backend/data/pekerjaan.json` dikurasi dari dataset
Kaggle (1.205 lowongan Indonesia dipetakan ke 10 profil; EDA di
`backend/data/eda_summary.md`, dibuat 2026-10-10).

Data sekunder mentah (pembanding/validasi, per `backend/data/README.md`):

| File | Sumber | Isi |
|------|--------|-----|
| `job_salary_mean.csv` | [kaggle.com/datasets/husnind/indonesia-average-job-salary](https://www.kaggle.com/datasets/husnind/indonesia-average-job-salary) | 32.976 lowongan Jobstreet Indonesia, **2024**, CC BY 4.0 — validasi rentang gaji |
| `lowongan_data_dan_analytics_jobstreet.csv` | [kaggle.com/datasets/raflirizkya/indonesian-data-and-analytics-jobs-in-jobstreet](https://www.kaggle.com/datasets/raflirizkya/indonesian-data-and-analytics-jobs-in-jobstreet) | 555 lowongan Data & Analytics, **25 Agu–24 Sep 2025** — validasi skill peran data |
| `glints_jobs.csv` | tidak terdokumentasi di repo | lowongan Glints (mentah) |

Catatan: data diambil dari **Kaggle**, bukan GitHub. Dataset terbaru
adalah September 2025 — repo ini **belum memiliki dataset tahun 2026**.

## Prasyarat

- Python 3.10+
- Node.js 20+

## Cara menjalankan

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

API jalan di http://localhost:8000.

Variabel lingkungan (opsional):

| Variabel      | Default               | Keterangan                              |
|---------------|-----------------------|-----------------------------------------|
| `PORT`        | `8000`                | port API                                |
| `FLASK_DEBUG` | (mati)                | isi `1` untuk mode debug                |
| `CORS_ORIGINS`| `http://localhost:5173` | daftar origin frontend, pisahkan koma |
| `DATABASE_URL`| (tidak diset)        | URL PostgreSQL; tanpa ini pakai JSON    |

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Buka http://localhost:5173, daftar akun, masuk, lalu isi skill + minat
di halaman Rekomendasi.

Variabel lingkungan (opsional):

| Variabel       | Default                 |
|----------------|-------------------------|
| `VITE_API_URL` | `http://localhost:8000` |

## Pengujian

```bash
cd backend
pip install -r requirements.txt
pytest -q        # 14 test: TC-01..TC-08 + relevansi + auth
```

```bash
cd frontend
npm run lint     # eslint, harus 0 error
npm run build    # build produksi
```

Rencana pengujian (black-box + evaluasi relevansi):
`docs/rencana-pengujian.md`.

## Dokumen penelitian

- `docs/usulan-penelitian.md` — judul, latar belakang, rumusan & tujuan
- `docs/bab3-metodologi.md` — metodologi penelitian
- `docs/contoh-perhitungan.md` — simulasi manual cosine similarity + SAW
- `docs/rencana-pengujian.md` — black-box test + evaluasi relevansi
- `docs/kajian-literatur.md` — kajian literatur
- `docs/validasi-data.md` — validasi dataset

## Catatan

- Akun pengguna tersimpan di `backend/data/users.json` (file lokal,
  di-ignore git) — cocok untuk demo/skripsi, bukan untuk produksi.
- Token login disimpan di memori proses backend dan kedaluwarsa 24 jam;
  restart server membatalkan semua sesi.
- Riwayat rekomendasi tersimpan di localStorage browser per perangkat.
