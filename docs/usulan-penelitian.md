# Usulan Penelitian

## Judul
**Sistem Pendukung Keputusan Pemilihan Karier Mahasiswa Informatika Menggunakan Content-Based Filtering dan Simple Additive Weighting (SAW)**

## Latar Belakang
Mahasiswa program studi Informatika menghadapi banyak pilihan bidang pekerjaan
setelah lulus — Frontend Developer, Backend Developer, Data Analyst, Cyber
Security Analyst, dan lain-lain. Banyak mahasiswa merasa bingung menentukan
bidang yang paling sesuai dengan skill yang dimiliki selama kuliah, sehingga
keputusan karier sering diambil tanpa dasar yang objektif.

Di sisi lain, data lowongan pekerjaan IT di Indonesia tersedia cukup banyak
(misalnya dataset IT Jobs Asia-Pacific dan JobStreet Indonesia tahun 2024),
tetapi datanya mentah dan tidak langsung menjawab pertanyaan mahasiswa:
*"dengan skill yang saya punya sekarang, karier apa yang paling cocok?"*

Sistem rekomendasi berbasis Content-Based Filtering (CBF) dapat menjembatani
kesenjangan ini: profil skill tiap pekerjaan dibangun dari data lowongan
nyata, lalu dicocokkan dengan skill mahasiswa menggunakan Cosine Similarity.
Karena kecocokan skill saja tidak cukup (minat, gaji, dan kebutuhan pasar
juga memengaruhi keputusan), skor-skor tersebut digabungkan dengan metode
SAW (Simple Additive Weighting) menjadi satu perangkingan akhir. Sistem juga
menyediakan roadmap belajar agar mahasiswa tahu langkah konkret menuju
karier yang direkomendasikan.

## Rumusan Masalah
1. Bagaimana membangun profil skill tiap bidang pekerjaan IT dari data
   lowongan nyata (Kaggle) agar dapat dipakai sebagai basis rekomendasi?
2. Bagaimana menerapkan Content-Based Filtering dengan Cosine Similarity
   untuk mengukur kecocokan antara skill mahasiswa dan profil pekerjaan?
3. Bagaimana menggabungkan skor kecocokan skill, minat, gaji, dan kebutuhan
   pasar dengan metode SAW menjadi perangkingan rekomendasi yang dapat
   dipertanggungjawabkan?

## Tujuan Penelitian
1. Membangun profil skill 10 bidang pekerjaan IT dari data lowongan
   Indonesia tahun 2024.
2. Mengimplementasikan Content-Based Filtering + Cosine Similarity untuk
   pencocokan skill mahasiswa terhadap profil pekerjaan.
3. Mengimplementasikan metode SAW untuk perangkingan akhir rekomendasi
   dari empat kriteria: kecocokan skill, minat, gaji, dan kebutuhan pasar.
4. Menyediakan roadmap belajar untuk setiap bidang karier yang
   direkomendasikan.

## Batasan Masalah
1. Cakupan 10 bidang pekerjaan IT populer di Indonesia.
2. Data lowongan dan gaji berasal dari dataset Kaggle tahun 2024
   (snapshot, bukan data real-time).
3. Input sistem berupa skill yang dipilih pengguna dan nilai minat
   per kategori (skala 1–5); sistem tidak menilai kemampuan secara langsung.
4. Pengujian dilakukan secara black-box dan kuesioner kepuasan pengguna.

## Manfaat Penelitian
- **Teoritis:** menunjukkan penerapan gabungan Content-Based Filtering,
  Cosine Similarity, dan SAW pada masalah rekomendasi karier.
- **Praktis:** membantu mahasiswa Informatika memilih bidang karier secara
  lebih objektif dan terarah, lengkap dengan roadmap belajar.
