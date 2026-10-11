# BAB 3 — Metodologi Penelitian (Draf)

## 3.1 Metode Penelitian
Penelitian ini menggunakan metode **R&D (Research and Development)** dengan
pendekatan deskriptif: mengembangkan sistem pendukung keputusan rekomendasi
karier, lalu mendeskripsikan kinerjanya melalui pengujian fungsional dan
perbandingan metode. Metode pengembangan perangkat lunak yang dipakai adalah
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
Perancangan sistem (arsitektur React–Flask–PostgreSQL, skema DB, endpoint API)
        |
Implementasi (CBF + Cosine Similarity, SAW, halaman web)
        |
Pengujian black-box (13 test case)
        |
Perbandingan metode (CBF+SAW vs Naive Bayes)
        |
Analisis hasil & penarikan kesimpulan
```

## 3.3 Teknik Pengumpulan Data
Seluruh data penelitian bersifat **sekunder** (diperoleh dari pihak lain,
bukan dikumpulkan langsung oleh peneliti):
1. **Studi literatur** — jurnal dan tesis tentang sistem rekomendasi,
   content-based filtering, dan SAW (lihat `kajian-literatur.md`).
2. **Dokumentasi dataset** — dataset publik Kaggle:
   - *IT Jobs in Asia-Pacific Region (May–June 2024)*, lisensi MIT —
     32.839 lowongan; dipakai 2.290 lowongan Indonesia.
   - *Indonesia Average Job Salary (JobStreet 2024)*, lisensi CC BY 4.0 —
     32.976 baris; dipakai 938 baris untuk info gaji.

## 3.4 Perancangan Sistem
- **Arsitektur:** frontend React (Vite) → REST API Flask → PostgreSQL
  (fallback JSON bila DB tidak tersedia).
- **Basis data:** tabel `kategori`, `pekerjaan`, `skill`,
  `pekerjaan_skill`, `roadmap` (lihat `backend/schema.sql`).
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
- **Konsistensi metode:** overlap@5 dan korelasi peringkat (Spearman's rho /
  Kendall's tau) antara perangkingan CBF+SAW dan Naive Bayes pada skenario
  input yang sama (lihat `rencana-pengujian.md` bagian B).
- **Kualitas data:** ringkasan EDA — distribusi lowongan, skill tersering,
  dan sebaran gaji (lihat `backend/data/eda_summary.md` + grafik).

## 3.6 Jadwal Penelitian (contoh, sesuaikan)
| Minggu | Kegiatan |
|--------|----------|
| 1–2 | Studi literatur & perumusan masalah |
| 3–4 | Pengumpulan & pra-pemrosesan data |
| 5–7 | Implementasi sistem |
| 8 | Pengujian black-box |
| 9 | Perbandingan metode & analisis |
| 10 | Analisis & penyusunan laporan |
