# Peta Dataset: File Apa Dipakai di Mana

Setiap file data di `backend/data/` dan perannya di aplikasi.
File mentah yang tidak dibaca kode sudah dihapus (2026-10-14);
nilainya dibakukan di `pekerjaan.json`.

## Dipakai aplikasi (jangan hapus)

Backend membaca seluruh data dari PostgreSQL (lihat `docs/erd.md`).
File di bawah ini adalah **bahan seed/dataset** — tidak dibaca aplikasi
saat berjalan, tapi jangan dihapus karena database dibuat dari sini.

| File | Peran | Dipakai di bagian |
|------|-------------|-------------------|
| `pekerjaan.json` | Bahan seed: `backend/data/generate_seed.py` → `backend/seed.sql` | Profil 23 karier: skill (CBF cosine), kategori minat, gaji_min/max + gaji_sumber (kriteria gaji SAW), demand + demand_sumber (kriteria demand SAW), roadmap quest (halaman Roadmap) |
| `glints_jobs.csv` | Bahan impor: `backend/data/load_glints.py` → tabel `lowongan_glints` | Endpoint `GET /pekerjaan/{id}/lowongan` — contoh lowongan nyata per karier; tampil di halaman Roadmap ("Lowongan terkait di Glints") |

## Sumber publik di luar repo (disitasi, tidak disimpan)

| Sumber | Dipakai untuk |
|--------|---------------|
| Dataset Kaggle husnind/indonesia-average-job-salary (2024) | Gaji network-engineer, dba, it-support |
| dinaspajak.com | Gaji cloud-engineer, embedded-engineer |
| radarbaru.com | Gaji game-developer |

## Dihapus 2026-10-14 (tidak dibaca kode mana pun)

- `job_salary_mean.csv` (2,4 MB) — nilai sudah diekstrak ke `pekerjaan.json`
- `lowongan_data_dan_analytics_jobstreet.csv` (1,1 MB) — tidak dipakai kode
