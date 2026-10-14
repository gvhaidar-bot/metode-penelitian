# Peta Dataset: File Apa Dipakai di Mana

Setiap file data di `backend/data/` dan perannya di aplikasi.
File mentah yang tidak dibaca kode sudah dihapus (2026-10-14);
nilainya dibakukan di `pekerjaan.json`.

## Dipakai aplikasi (jangan hapus)

| File | Dibaca oleh | Dipakai di bagian |
|------|-------------|-------------------|
| `pekerjaan.json` | `backend/app.py` (`PEKERJAAN`) | Profil 23 karier: skill (CBF cosine), kategori minat, gaji_min/max + gaji_sumber (kriteria gaji SAW), demand + demand_sumber (kriteria demand SAW), ai_risk (badge tampilan), roadmap quest (halaman Roadmap) |
| `bobot.json` | `backend/app.py` | Bobot kriteria SAW: skill 0,45, minat 0,25, gaji 0,15, demand 0,15 |
| `glints_jobs.csv` | `backend/glints.py` | Endpoint `GET /pekerjaan/{id}/lowongan` — contoh lowongan nyata per karier; tampil di halaman Roadmap ("Lowongan terkait di Glints") |
| `glints_stats.json` | `backend/data/build_glints.py` (output) | Ringkasan pemetaan: jumlah lowongan + median gaji per karier. Sumber angka gaji 17 karier dan demand (formula log) di `pekerjaan.json` |
| `users.json` | `backend/db.py` | Akun pengguna (runtime, bukan dataset penelitian) |

## Sumber publik di luar repo (disitasi, tidak disimpan)

| Sumber | Dipakai untuk |
|--------|---------------|
| Dataset Kaggle husnind/indonesia-average-job-salary (2024) | Gaji network-engineer, dba, it-support |
| dinaspajak.com | Gaji cloud-engineer, embedded-engineer |
| radarbaru.com | Gaji game-developer |
| Frey & Osborne (2013), Oxford Martin School | Label risiko AI per karier (`ai_risk`) |

## Dihapus 2026-10-14 (tidak dibaca kode mana pun)

- `job_salary_mean.csv` (2,4 MB) — nilai sudah diekstrak ke `pekerjaan.json`
- `lowongan_data_dan_analytics_jobstreet.csv` (1,1 MB) — tidak dipakai kode
