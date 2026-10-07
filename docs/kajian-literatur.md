# Kajian Literatur

## 1. Sistem Rekomendasi Berbasis Content-Based Filtering
Content-Based Filtering (CBF) adalah pendekatan sistem rekomendasi yang
mencocokkan profil pengguna dengan fitur-fitur konten item. Berbeda dengan
collaborative filtering yang membutuhkan riwayat banyak pengguna, CBF dapat
bekerja sejak awal hanya dengan deskripsi item — cocok untuk masalah
rekomendasi karier di mana profil tiap pekerjaan dibangun dari data
lowongan.

Shamsul (2025) membangun sistem rekomendasi karier untuk pasar kerja
Malaysia menggunakan CBF dengan TF-IDF dan cosine similarity untuk
mencocokkan skill, latar pendidikan, dan preferensi pengguna dengan peluang
karier. Evaluasinya mencapai precision 96%, recall 100%, dan F1-score 98%,
serta merekomendasikan data real-time dari JobStreet untuk pengembangan
lebih lanjut — pendekatan yang sejalan dengan penelitian ini yang memakai
data JobStreet Indonesia 2024.
Sumber: https://ir.uitm.edu.my/id/eprint/115099/

Bucad (2024) mengembangkan sistem rekomendasi jalur karier untuk siswa
dengan menggabungkan content-based filtering dan beberapa algoritma
klasifikasi (decision tree, KNN, Naïve Bayes, SVM) sebagai pembanding,
menunjukkan bahwa CBF lazim dipadukan dengan metode lain untuk evaluasi.
Sumber: https://rsisinternational.org/journals/ijrias/articles/towards-the-development-of-a-career-path-recommender-system-for-senior-high-school-in-selected-public-schools-using-multi-label-classification/

Mpia dkk. membangun recommender employability untuk lulusan IT dengan
content-based filtering yang memakai kompetensi akademik sebagai faktor
kontekstual, menunjukkan relevansi CBF untuk domain karier lulusan
informatika.
Sumber: https://www.researchgate.net/publication/347826582_Product_recommender_system_using_neural_collaborative_filtering_for_marketplace_in_indonesia

## 2. Cosine Similarity
Cosine similarity mengukur kesamaan dua vektor berdasarkan sudut di
antaranya, bernilai 0 (tidak mirip) hingga 1 (identik). Dalam CBF, skill
pengguna dan profil skill pekerjaan direpresentasikan sebagai vektor biner
(ada/tidak ada skill), sehingga cosine similarity menjadi ukuran kecocokan
yang sederhana, cepat, dan mudah dijelaskan — sesuai kebutuhan penelitian
ini yang mengutamakan keterjelasan metode.

## 3. Simple Additive Weighting (SAW)
SAW adalah metode pengambilan keputusan multikriteria klasik: setiap
alternatif dinilai per kriteria, dinormalisasi, lalu dijumlahkan dengan
bobot (Hwang & Yoon, 1981 — literatur dasar MADM). Pada penelitian ini SAW
menggabungkan empat kriteria: kecocokan skill (45%), minat (25%), gaji
(15%), dan kebutuhan pasar (15%), sehingga rekomendasi tidak hanya
didasarkan pada skill, melainkan juga faktor keputusan karier yang realistis.

## 4. Posisi Penelitian Ini
Penelitian-penelitian di atas memakai CBF untuk rekomendasi karier, tetapi
umumnya berhenti pada skor kemiripan tunggal. Kontribusi penelitian ini:
(1) profil pekerjaan dibangun dari data lowongan Indonesia 2024 yang
diagregasi per karier; (2) skor kemiripan digabung dengan minat, gaji, dan
demand pasar via SAW; (3) setiap rekomendasi dilengkapi roadmap belajar
berbasis pengetahuan — rantai lengkap dari diagnosis skill sampai rencana
tindak lanjut.

## Daftar Pustaka Sementara
- Shamsul, M. L. (2025). *Career recommender system in Malaysia using
  content-based filtering.* Degree thesis, Universiti Teknologi MARA.
- Bucad, A. T. (2024). Towards the development of a career path recommender
  system for senior high school... *IJRIAS*, 9(3), 374–382.
  https://doi.org/10.51584/IJRIAS.2024.90334
- Mpia, H. N., Mburu, L., & Mwendia, S. (2020). Product recommender system
  using neural collaborative filtering for marketplace in Indonesia.
  *ResearchGate.* (kajian employability lulusan IT dengan CBF)
- Hwang, C. L., & Yoon, K. (1981). *Multiple Attribute Decision Making:
  Methods and Applications.* Springer. (rujukan metode SAW/MADM)

> Catatan: lengkapi dengan 3–5 jurnal tambahan dari Google Scholar sesuai
> arahan dosen pembimbing sebelum disidangkan.
