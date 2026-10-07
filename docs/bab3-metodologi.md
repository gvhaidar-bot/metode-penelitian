# BAB 3 — Metodologi Penelitian (Draf)

## 3.1 Metode Penelitian
Penelitian ini menggunakan metode **R&D (Research and Development)** dengan
pendekatan deskriptif: mengembangkan sistem pendukung keputusan rekomendasi
karier, lalu mendeskripsikan kinerjanya melalui pengujian fungsional dan
kuesioner pengguna. Metode pengembangan perangkat lunak yang dipakai adalah
**Prototype** — sistem dibangun bertahap berdasarkan umpan balik hingga
memenuhi kebutuhan.

## 3.2 Tahapan Penelitian
```
Studi literatur & observasi masalah
        |
Pengumpulan data (dataset Kaggle: lowongan IT Asia-Pasifik + gaji JobStreet 2024)
        |
Pra-pemrosesan data (filter Indonesia → pemetaan 10 karier → agregasi skill → join gaji)
        |
Perancangan sistem (arsitektur React–FastAPI–PostgreSQL, skema DB, endpoint API)
        |
Implementasi (CBF + Cosine Similarity, SAW, halaman web)
        |
Pengujian black-box (13 test case)
        |
Kuesioner kepuasan pengguna (skala Likert, ±30 responden)
        |
Analisis hasil & penarikan kesimpulan
```

## 3.3 Teknik Pengumpulan Data
1. **Studi literatur** — jurnal dan tesis tentang sistem rekomendasi,
   content-based filtering, dan SAW (lihat `kajian-literatur.md`).
2. **Dokumentasi dataset** — dataset publik Kaggle:
   - *IT Jobs in Asia-Pacific Region (May–June 2024)*, lisensi MIT —
     32.839 lowongan; dipakai 2.290 lowongan Indonesia.
   - *Indonesia Average Job Salary (JobStreet 2024)*, lisensi CC BY 4.0 —
     32.976 baris; dipakai 938 baris untuk info gaji.
3. **Kuesioner** — 8 pernyataan skala Likert 1–5 kepada ±30 mahasiswa
   Informatika (lihat `rencana-pengujian.md` bagian B).

## 3.4 Perancangan Sistem
- **Arsitektur:** frontend React (Vite) → REST API FastAPI → PostgreSQL
  (fallback JSON bila DB tidak tersedia).
- **Basis data:** tabel `pekerjaan`, `pekerjaan_skill`, `roadmap`
  (lihat `backend/schema.sql`).
- **Alur rekomendasi:**
  1. Pengguna memilih skill + menilai minat per kategori (1–5).
  2. Sistem menghitung cosine similarity antara vektor skill pengguna
     dan vektor profil skill tiap pekerjaan.
  3. Metode SAW menggabungkan empat kriteria berbobot:
     skor = 0,45×skill + 0,25×minat + 0,15×gaji + 0,15×demand.
  4. Sistem menampilkan 5 karier teratas + roadmap belajar + riwayat.

## 3.5 Teknik Analisis Data
- **Kinerja fungsional:** persentase test case black-box yang lolos
  (target 100%).
- **Kepuasan pengguna:** rata-rata skor Likert per pernyataan dan
  keseluruhan; rata-rata ≥ 4,0 diinterpretasikan "Baik/Sangat Baik".
- **Kualitas data:** ringkasan EDA — distribusi lowongan, skill tersering,
  dan sebaran gaji (lihat `backend/data/eda_summary.md` + grafik).

## 3.6 Jadwal Penelitian (contoh, sesuaikan)
| Minggu | Kegiatan |
|--------|----------|
| 1–2 | Studi literatur & perumusan masalah |
| 3–4 | Pengumpulan & pra-pemrosesan data |
| 5–7 | Implementasi sistem |
| 8 | Pengujian black-box |
| 9 | Penyebaran & rekap kuesioner |
| 10 | Analisis & penyusunan laporan |
