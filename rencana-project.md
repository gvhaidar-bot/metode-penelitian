# Rencana Project: Sistem Rekomendasi Bidang Karier untuk Mahasiswa IT

Disusun: 2026-10-07 | Status: perencanaan (dilanjutkan nanti)

## 1. Masalah
Mahasiswa IT bingung memilih bidang pekerjaan setelah lulus yang sesuai dengan jurusan dan skill yang dimiliki.

## 2. Solusi yang Diusulkan
Web app: user memasukkan skill IT yang dimiliki (+ minat), sistem mencocokkan dengan profil pekerjaan IT dan mengeluarkan:
- ranking bidang pekerjaan yang paling cocok,
- roadmap belajar ("kalau mau jadi X, pelajari Y dulu"),
- info prospek (gaji, kebutuhan pasar).

Judul usulan: *"Sistem Rekomendasi Bidang Karier Berbasis Content-Based Filtering untuk Mahasiswa Informatika"*

## 3. Metode
- **Metode penelitian:** R&D (Research and Development) / deskriptif + pengembangan sistem.
- **Metode pengembangan perangkat lunak:** Prototype (alternatif: Waterfall bila dosen meminta).
- **Algoritma utama:** Content-Based Filtering + Cosine Similarity (pencocokan skill → profil pekerjaan).
- **Penggabung kriteria:** SAW — skor akhir = (bobot₁ × kecocokan skill) + (bobot₂ × minat) + (bobot₃ × prospek).
- **Roadmap belajar:** knowledge-based (aturan berjenjang per karier, dari literatur).
- **Pembanding (opsional):** Naive Bayes bila ada data alumni berlabel (skill → pekerjaan aktual).
- **Pengumpulan data:** studi literatur + kuesioner (mahasiswa/HRD).
- **Pengujian:** black-box testing + kuesioner kepuasan pengguna (skala Likert).

## 4. Tech Stack
- Frontend: React JS
- Backend: Python + Flask (REST API, JSON)
- Database: PostgreSQL
- Alur: React → POST /rekomendasi → Flask hitung cosine similarity → kembalikan ranking + roadmap + prospek.

Endpoint usulan: `POST /rekomendasi`, `GET /pekerjaan`, `GET /pekerjaan/{id}/roadmap`.

## 5. Dataset (Kaggle)
1. **IT Jobs in Asia-Pacific Region (May–June 2024)** — utama
   https://www.kaggle.com/datasets/sergeychekurin/it-jobs-in-asia-pacific-region-may-june-2024
   6 CSV: judul, negara (filter Indonesia), level, spesialisasi, gaji, tools/teknologi, bahasa pemrograman, sertifikasi. Lisensi MIT.
   → bahan profil skill pekerjaan untuk content-based filtering.
2. **Indonesia Average Job Salary (JobStreet Indonesia 2024)** — pendukung prospek
   https://www.kaggle.com/datasets/husnind/indonesia-average-job-salary
   32.976 lowongan: judul, perusahaan, lokasi, gaji rata-rata (IDR). Lisensi CC BY 4.0.
   → filter judul IT, join dengan dataset 1 untuk info gaji/prospek.

Catatan: snapshot 2024 (masuk rentang 2020–2026); dataset multi-tahun spesifik Indonesia+IT tidak tersedia di Kaggle.

## 6. Langkah Berikutnya
- [ ] Unduh kedua dataset (butuh akun Kaggle gratis)
- [ ] EDA awal: pekerjaan IT Indonesia, skill tersering, gaji per bidang
- [ ] Susun rumusan masalah & tujuan penelitian
- [ ] Rancang skema database + daftar endpoint API
- [ ] Contoh perhitungan cosine similarity + SAW (simulasi kecil)
