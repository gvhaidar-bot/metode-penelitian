# Sistem Rekomendasi Karier Mahasiswa Informatika

![Python](https://img.shields.io/badge/Python-3.10%2B-blue)
![Flask](https://img.shields.io/badge/Flask-3.x-black)
![React](https://img.shields.io/badge/React-19-61dafb)
![Vite](https://img.shields.io/badge/Vite-8-646cff)
![Metode](https://img.shields.io/badge/Metode-CBF%20%2B%20SAW-green)

Web app Sistem Pendukung Keputusan (SPK) untuk rekomendasi bidang karier
mahasiswa Informatika. Pengguna memasukkan skill yang dikuasai dan menilai
minatnya, sistem mencocokkan dengan profil 23 bidang pekerjaan IT lalu
mengeluarkan ranking karier, roadmap belajar, dan info prospek (gaji,
kebutuhan pasar).

Judul penelitian: *Rancang Bangun Sistem Pendukung Keputusan Rekomendasi
Karier Mahasiswa Informatika Berbasis Web Menggunakan Metode Content-Based
Filtering dan Simple Additive Weighting (SAW)*.

## Fitur

- Register/login/logout dengan token (password di-hash)
- Profil skill per akun: cari dari daftar master atau usulkan skill sendiri
- Minat memakai ranking 5 kategori tanpa angka (paling diminati dulu), dikonversi ke bobot kriteria minat SAW via Rank Order Centroid
- Rekomendasi karier berbasis skill + minat (CBF + SAW)
- Ranking karier teratas + rincian skor per kriteria
- Roadmap belajar tiap karier sebagai quest yang bisa dicentang, progres tersimpan di akun
- Riwayat rekomendasi tersimpan di server per akun (login di mana saja, data ikut)
- Contoh lowongan Glints per karier di halaman roadmap
- Proteksi route: halaman dalam hanya bisa diakses setelah login

## Metode

1. **Content-Based Filtering + Cosine Similarity** — mencocokkan vektor
   skill pengguna dengan vektor skill tiap pekerjaan.
2. **SAW (Simple Additive Weighting)** — merangking hasil dari 4 kriteria:
   kecocokan skill (bobot 0,45), minat (0,25), gaji (0,15), kebutuhan pasar
   (0,15). Bobot tersimpan di `backend/data/bobot.json` sehingga mudah
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
│   │   ├── pekerjaan.json  # 23 profil karier (skill, gaji, demand, roadmap)
│   │   ├── bobot.json      # bobot kriteria SAW
│   │   ├── glints_jobs.csv # 1.133 lowongan Glints (untuk endpoint lowongan)
│   │   └── glints_stats.json # ringkasan pemetaan Glints per karier
│   ├── tests/test_api.py   # test otomatis (pytest, 31 test)
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

Profil 23 karier di `backend/data/pekerjaan.json` dikurasi dari dataset
Kaggle (1.205 lowongan Indonesia dipetakan ke 10 profil pada EDA 2026-10-10,
sebelum perluasan ke 23 karier; EDA di `backend/data/eda_summary.md`).

Data sekunder mentah (per `backend/data/README.md`):

| File | Sumber | Isi |
|------|--------|-----|
| `glints_jobs.csv` | scraping tim (commit `211db6f5`, 2026-10-12) | 1.133 lowongan Glints Indonesia, diklaim **Mei–Jun 2026** — 597 terpetakan ke 23 karier via `backend/glints.py`; kolom `posted_date` hanya berisi tanggal relatif ("Kemarin", "N hari yang lalu") sehingga klaim tahun tidak bisa diverifikasi dari isi file. Detail: `docs/integrasi-glints.md` |

Dataset Kaggle (husnind/indonesia-average-job-salary 2024; raflirizkya JobStreet
data & analytics Agu–Sep 2025) dipakai sebagai sumber angka gaji 3 karier
(network, dba, it-support) lalu file mentahnya dihapus dari repo — nilainya
sudah dibakukan di `pekerjaan.json` beserta sumbernya
(`docs/provenance-data.md`).

**Penggunaan di aplikasi:** endpoint `GET /pekerjaan/{id}/lowongan`
menampilkan contoh lowongan Glints per karier; halaman Roadmap punya
bagian "Lowongan terkait di Glints". Profil karier (`pekerjaan.json`)
tidak dikalibrasi ulang agar contoh perhitungan manual tetap valid.

Catatan: data diambil dari **Kaggle**, bukan GitHub — kecuali
`glints_jobs.csv` yang diklaim hasil scraping tim sendiri (Mei–Jun 2026).

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
pytest -q        # 29 test: TC-01..TC-08 + relevansi + auth + tokenisasi
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
- Riwayat rekomendasi, skill profil, dan progres quest tersimpan di
  `backend/data/users.json` per akun sehingga terbawa saat login
  di perangkat lain.
