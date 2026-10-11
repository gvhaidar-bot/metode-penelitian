# Validasi Data Profil Karier terhadap Dataset Riil

Tanggal: 2026-10-11. Tujuan: memvalidasi profil 10 karier (kurasi) terhadap
data lowongan Indonesia dari Kaggle, sebagai bukti pertanggungjawaban data
sekunder. Dataset operasional sistem TETAP 10 profil kurasi; dataset riil
dipakai sebagai pembanding/validasi, bukan pengganti.

## Sumber pembanding

1. **husnind/indonesia-average-job-salary** — 32.976 lowongan Jobstreet
   Indonesia, 2024, lisensi CC BY 4.0. Kolom: judul, perusahaan, lokasi,
   gaji rata-rata (IDR). Tidak ada kolom skill.
2. **raflirizkya/indonesian-data-and-analytics-jobs-in-jobstreet** — 555
   lowongan peran Data & Analytics, Jobstreet Indonesia, 25 Agu–24 Sep 2025.
   Kolom: posisi, perusahaan, kota, provinsi, gaji, tools, pendidikan,
   pengalaman, deskripsi, level.

## Metode validasi

- Gaji: judul lowongan dipetakan ke 10 karier via kata kunci, lalu dihitung
  median/min/maks gaji (dalam juta IDR). Pemetaan kata kunci bersifat kasar;
  n kecil (<10) ditandai.
- Skill: frekuensi tools pada dataset 2025 (peran data) dibandingkan dengan
  daftar skill profil kurasi.

## Hasil validasi gaji

| Karier | Kurasi (jt) | Median riil 2024 (jt) | n | Status |
|---|---|---|---|---|
| Frontend Developer | 7,1–9,1 | 8,0 | 11 | Selaras |
| Backend Developer | 7,2–9,5 | 7,7 | 17 | Selaras |
| Mobile Developer | 4,8–4,8 | 9,7 | 8 | MELESET — kurasi terlalu rendah; min=max menandakan placeholder |
| Data Analyst | 5,9–6,8 | 6,1 | 10 | Selaras |
| ML Engineer | 6,5–7,9 | 7,2 | 6 | Selaras |
| UI/UX Designer | 5,2–6,0 | 5,3 | 5 | Selaras |
| DevOps Engineer | 4,3–8,2 | 3,7 | 2 | n terlalu kecil, belum dapat disimpulkan |
| Cyber Security Analyst | 5,6–8,9 | 6,8 | 57 | Selaras |
| QA Engineer | 4,8–9,2 | 6,2 | 72 | Selaras |
| IT Project Manager | 10,5–14,1 | 10,6 | 67 | Selaras (median di batas bawah kurasi) |

## Hasil validasi skill (peran data, 2025)

Tools tersering di lowongan riil: Excel (216), SQL (162), Power BI (102),
Tableau (95), Python (77), R (44), Looker (34).

Profil kurasi Data Analyst memuat: SQL, Python, Power BI, Tableau, MS Excel,
AWS, Azure, Java, SQL Server, Kafka, Spark, Google Cloud.

- 5 tools teratas riil (Excel, SQL, Power BI, Tableau, Python) SEMUA ada di
  profil kurasi — selaras.
- R (44 kemunculan) TIDAK ada di profil kurasi — pertimbangkan ditambahkan.
- Java, Kafka, Spark, AWS, Azure, Google Cloud, SQL Server jarang/tidak
  muncul di 555 lowongan ini — pertimbangkan dikeluarkan atau diberi catatan.
- Batasan: hanya 1 bulan data dan 555 baris; temuan ini sinyal, bukan vonis.

## Keterbatasan

- Dataset gaji mentah mengandung **22.020 baris duplikat persis (66,8%)**;
  validasi di atas dihitung ulang setelah deduplikasi (10.956 baris unik)
  dan median tiap peran praktis tidak berubah — kesimpulan validasi tetap
  berlaku.
- Dataset 555 lowongan **terkonsentrasi di Jakarta (71,9%)**; jangan klaim
  mewakili pasar kerja Indonesia secara merata — cakupan geografis adalah
  Indonesia dengan konsentrasi Jakarta.
- Skor demand (1–5) di profil kurasi BELUM tervalidasi: dataset 2024
  berbentuk agregat (bukan volume mentah) dan dataset 2025 hanya mencakup
  peran data selama 1 bulan. Skor demand tetap estimasi kurasi.
- Pemetaan judul→karier via kata kunci bersifat kasar (mis. "Project
  Manager" dapat mencakup non-IT).
- Gaji dataset 2024 adalah rata-rata per jabatan-perusahaan-lokasi, bukan
  rentang min–maks seperti di profil kurasi.

## Kalibrasi yang diterapkan (2026-10-11, atas persetujuan peneliti)

1. Mobile Developer: gaji 4,8–4,8 → **7,5–11,5** (median riil 9,7; min 4,9;
   maks 16,5; n=8). Berlaku di `backend/data/pekerjaan.json` dan
   `backend/seed.sql` (diregenerasi).
2. Data Analyst: **tambah R**; **hapus Java dan Kafka** (paling lemah
   dukungannya di data riil). Spark, AWS, Azure, Google Cloud, SQL Server
   dipertahankan — masih relevan secara domain dan sampel 1 bulan terlalu
   tipis untuk membuangnya.
3. Skor demand: TIDAK diubah — tetap estimasi kurasi sampai ada sumber
   volume lowongan per peran yang valid.

Catatan untuk peneliti: setelah `git pull`, database lokal perlu
disegarkan karena seed bersifat insert-only:
```sql
TRUNCATE pekerjaan, kategori, skill, pekerjaan_skill, roadmap RESTART IDENTITY CASCADE;
```
lalu jalankan ulang `backend/seed.sql`.
