# Sistem Rekomendasi Bidang Karier untuk Mahasiswa IT

Web app: mahasiswa memasukkan skill IT yang dikuasai + nilai minat,
sistem mencocokkannya dengan profil 10 bidang pekerjaan IT lalu
mengeluarkan ranking karier yang paling cocok, roadmap belajar,
dan info prospek (gaji, kebutuhan pasar).

**Metode:** Content-Based Filtering + Cosine Similarity (pencocokan skill),
digabung dengan SAW — Simple Additive Weighting (ranking dari 4 kriteria:
kecocokan skill, minat, gaji, kebutuhan pasar).

Judul penelitian: *Sistem Pendukung Keputusan Pemilihan Karier Mahasiswa
Informatika Menggunakan Content-Based Filtering dan Simple Additive
Weighting (SAW)*.

## Struktur repo

```
backend/    Flask REST API (auth, rekomendasi, data pekerjaan)
frontend/   React + Vite + Tailwind (UI)
docs/       Dokumen penelitian (usulan, metodologi, diagram, pengujian)
rencana-project.md  Rencana awal project
```

## Cara menjalankan (fullstack)

```bash
# Terminal 1 — backend
cd backend
pip install -r requirements.txt
python app.py        # http://localhost:8000

# Terminal 2 — frontend
cd frontend
npm install
npm run dev          # http://localhost:5173
```

Buka http://localhost:5173, daftar akun, masuk, lalu isi skill + minat
di halaman Rekomendasi.

## Test backend

```bash
cd backend
pytest -q
```

## Dokumen penting

- `docs/usulan-penelitian.md` — judul, latar belakang, rumusan & tujuan
- `docs/bab3-metodologi.md` — metodologi penelitian
- `docs/contoh-perhitungan.md` — simulasi manual cosine similarity + SAW
- `docs/rencana-pengujian.md` — black-box test + evaluasi relevansi
- `docs/kajian-literatur.md`, `docs/validasi-data.md` — landasan & data
