# Data Sekunder (Kaggle)

Dataset publik yang dipakai sebagai **pembanding/validasi** profil karier
kurasi (`pekerjaan.json`). Dataset operasional sistem tetap 10 profil kurasi;
file-file ini adalah bukti pertanggungjawaban data sekunder.

## 1. job_salary_mean.csv
- Sumber: https://www.kaggle.com/datasets/husnind/indonesia-average-job-salary
- Isi: 32.976 lowongan Jobstreet Indonesia, **2024**, lisensi CC BY 4.0
- Kolom: Judul Pekerjaan, Perusahaan, Lokasi, Gaji_Rata2 (IDR)
- Dipakai untuk: validasi/kalibrasi rentang gaji tiap peran IT

## 2. lowongan_data_dan_analytics_jobstreet.csv
- Sumber: https://www.kaggle.com/datasets/raflirizkya/indonesian-data-and-analytics-jobs-in-jobstreet
- Isi: 555 lowongan peran Data & Analytics, Jobstreet Indonesia,
  **25 Agustus–24 September 2025**
- Kolom: posisi, perusahaan, kota, provinsi, gaji, tools, pendidikan,
  pengalaman, deskripsi_lengkap, level
- Dipakai untuk: validasi daftar skill peran data (Data Analyst, dkk.)

Hasil validasi: lihat `docs/validasi-data.md`.
