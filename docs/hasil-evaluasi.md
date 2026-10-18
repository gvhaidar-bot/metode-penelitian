# Hasil Evaluasi Rekomendasi

Metode: Content-Based Filtering + Cosine Similarity + SAW. Seluruh evaluasi memakai data sekunder.

## Pengukuran saat ini (2026-10-18, data 23 karier)

Diukur dengan kode asli (endpoint `/rekomendasi` + `hitung_skor`) pada
data 23 karier saat ini, database SQLite sementara seperti pola
`backend/tests/test_api.py`. Skenario memakai model minat **ranking**
(bukan skala 1–5): kategori target di posisi 1, sisanya dalam urutan
`MINAT_LENGKAP` = Data & AI, Web, Mobile, Infrastruktur & Keamanan,
Desain & Manajemen.

## B. Evaluasi Relevansi Rekomendasi (hit@3)

### S1: Calon Data Analyst
- Input skill: Python, SQL; minat: Data & AI peringkat 1.
- Ekspektasi: data-analyst, ml-engineer, data-scientist, atau data-engineer di 3 teratas.
- Top-5 sistem:
  1. Data Analyst (50,1%; skill 42,6%, minat 45,7%, gaji 30,0%, demand 100,0%)
  2. Data Engineer (50,1%; skill 42,6%, minat 45,7%, gaji 50,0%, demand 80,0%)
  3. QA Engineer (43,9%; skill 36,5%, minat 25,7%, gaji 40,0%, demand 100,0%)
  4. Data Scientist (43,6%; skill 37,8%, minat 45,7%, gaji 41,5%, demand 60,0%)
  5. Machine Learning Engineer (38,2%; skill 19,6%, minat 45,7%, gaji 40,0%, demand 80,0%)
- **hit@3: 1**
- Catatan: Data Analyst dan Data Engineer seri di 50,1% (urutan
  ditentukan stable sort / urutan seed).

### S2: Calon Frontend Developer
- Input skill: HTML, CSS, JavaScript; minat: Web peringkat 1.
- Ekspektasi: frontend-dev di 3 teratas.
- Top-5 sistem:
  1. Frontend Developer (54,6%; skill 52,2%, minat 45,7%, gaji 31,0%, demand 100,0%)
  2. Fullstack Developer (51,2%; skill 50,0%, minat 45,7%, gaji 35,0%, demand 80,0%)
  3. Backend Developer (40,6%; skill 14,9%, minat 45,7%, gaji 50,0%, demand 100,0%)
  4. UI/UX Designer (39,6%; skill 43,3%, minat 4,0%, gaji 27,5%, demand 100,0%)
  5. QA Engineer (39,1%; skill 14,9%, minat 45,7%, gaji 40,0%, demand 100,0%)
- **hit@3: 1**

### S3: Calon Backend / Mobile (PHP)
- Input skill: PHP, Laravel; minat: Web peringkat 1.
- Ekspektasi: backend-dev, mobile-dev di 3 teratas.
- Top-5 sistem:
  1. Backend Developer (50,3%; skill 36,5%, minat 45,7%, gaji 50,0%, demand 100,0%)
  2. QA Engineer (32,4%; skill 0,0%, minat 45,7%, gaji 40,0%, demand 100,0%)
  3. Frontend Developer (31,1%; skill 0,0%, minat 45,7%, gaji 31,0%, demand 100,0%)
  4. Fullstack Developer (28,7%; skill 0,0%, minat 45,7%, gaji 35,0%, demand 80,0%)
  5. Data Analyst (25,9%; skill 0,0%, minat 25,7%, gaji 30,0%, demand 100,0%)
- **hit@3: 1**
- Catatan: uji silang langsung oleh peneliti pada hari yang sama
  (minat Data & AI peringkat 1, Web peringkat 3) juga menghasilkan
  Backend Developer #1 (43%) — kesimpulan sama walau ranking minat
  berbeda.

### S4: Calon UI/UX Designer
- Input skill: Figma; minat: Desain & Manajemen peringkat 1.
- Ekspektasi: uiux-designer di 3 teratas.
- Top-5 sistem:
  1. Product Manager (43,9%; skill 28,9%, minat 45,7%, gaji 50,0%, demand 80,0%)
  2. IT Project Manager (43,7%; skill 25,0%, minat 45,7%, gaji 60,0%, demand 80,0%)
  3. UI/UX Designer (41,8%; skill 25,0%, minat 45,7%, gaji 27,5%, demand 100,0%)
  4. Business Analyst (31,3%; skill 0,0%, minat 45,7%, gaji 52,5%, demand 80,0%)
  5. Backend Developer (26,4%; skill 0,0%, minat 15,7%, gaji 50,0%, demand 100,0%)
- **hit@3: 1**

**Rata-rata hit@3: 4/4 = 1,00**

## C. Analisis Sensitivitas Bobot SAW (overlap@5 vs baseline)

| Skenario | Skill-heavy (0,60/0,20/0,10/0,10) | Seimbang (0,25/0,25/0,25/0,25) | Minat-heavy (0,25/0,45/0,15/0,15) |
|---|---|---|---|
| S1: Calon Data Analyst | 1,00 | 0,80 | 1,00 |
| S2: Calon Frontend Developer | 1,00 | 1,00 | 1,00 |
| S3: Calon Backend / Mobile (PHP) | 1,00 | 1,00 | 1,00 |
| S4: Calon UI/UX Designer | 0,80 | 1,00 | 0,80 |

Interpretasi: overlap@5 = 1,00 berarti ranking 5 teratas identik dengan
baseline (robust terhadap perubahan bobot); 0,80 berarti 4 dari 5 sama
(satu posisi bergeser). Nilai dihitung per skenario karena sensitivitas
dapat berbeda antar profil user.

### Catatan analis (bahan bab pembahasan)

1. **Efek kriteria gaji sebagai benefit, masih teramati.** Pada S3,
   QA Engineer (#2) dan Frontend Developer (#3) memiliki skor skill
   0,0% tetapi tetap masuk 3 besar berkat minat + gaji + demand. Pada
   S4, Product Manager dan IT Project Manager mengungguli UI/UX
   Designer terutama karena gaji (50,0% / 60,0% vs 27,5%). Ini contoh
   nyata pertanyaan 'apakah gaji memang layak diperlakukan sebagai
   kriteria benefit untuk semua mahasiswa?' — layak dibahas satu
   paragraf di skripsi.
2. **Anomali S3 lama terperbaiki oleh data baru.** Pada pengukuran
   lama (data sebelum merge), Frontend Developer mengungguli Backend
   Developer untuk input PHP+Laravel karena profil backend-dev belum
   memuat 'Laravel'. Pada data 23 karier saat ini, Backend Developer
   menempati peringkat 1 (50,3%) — pengayaan Glints memperbaiki
   kelengkapan profil.
3. **Stabilitas bobot.** Ranking 5 teratas praktis tidak berubah di
   hampir semua varian (overlap@5 = 1,00); hanya varian 'Seimbang'
   menggeser satu posisi pada S1, dan varian 'Skill-heavy' /
   'Minat-heavy' menggeser satu posisi pada S4 (keduanya 0,80).
   Artinya pilihan baseline 0,45/0,25/0,15/0,15 cukup robust — hasil
   ini dapat dipakai sebagai bahan justifikasi bobot di bab pembahasan.

## Arsip: pengukuran lama (data sebelum merge, 14 karier)

> Hasil di bawah diukur sebelum merge `newest` ke `collab` (data 14
> karier, model minat skala 1–5). Disimpan sebagai arsip; angka
> saat ini adalah pengukuran 2026-10-18 di atas.

### S1: Calon Data Analyst (lama)
- Input skill: Python, SQL; minat: Data & AI=5 (kategori lain netral=3)
- Top-5: 1. Data Analyst (54,4%) 2. IT Project Manager (51,4%)
  3. Backend Developer (49,3%) 4. QA Engineer (46,2%)
  5. Machine Learning Engineer (45,6%)
- **hit@3: 1**

### S2: Calon Frontend Developer (lama)
- Input skill: HTML, CSS, JavaScript; minat: Web=5
- Top-5: 1. Frontend Developer (66,2%) 2. Backend Developer (57,6%)
  3. UI/UX Designer (46,9%) 4. QA Engineer (45,3%)
  5. IT Project Manager (33,0%)
- **hit@3: 1**

### S3: Calon Backend / Mobile (PHP) (lama)
- Input skill: PHP, Laravel; minat: Web=5
- Top-5: 1. Frontend Developer (62,1%) 2. Backend Developer (59,3%)
  3. Mobile Developer (48,6%) 4. QA Engineer (37,8%)
  5. IT Project Manager (33,0%)
- **hit@3: 1**
- Catatan arsip: Frontend #1 di sini adalah anomali data lama (profil
  backend-dev belum memuat Laravel); lihat catatan analis butir 2 di
  atas untuk perbaikan pada data baru.

### S4: Calon UI/UX Designer (lama)
- Input skill: Figma; minat: Desain & Manajemen=5
- Top-5: 1. IT Project Manager (56,0%) 2. UI/UX Designer (47,4%)
  3. Backend Developer (40,1%) 4. Frontend Developer (33,7%)
  5. DevOps Engineer (32,7%)
- **hit@3: 1**

**Rata-rata hit@3 (lama): 4/4 = 1,00**

### Sensitivitas lama (overlap@5 vs baseline)

| Skenario | Skill-heavy | Seimbang | Minat-heavy |
|---|---|---|---|
| S1 | 1,00 | 0,80 | 1,00 |
| S2 | 1,00 | 0,80 | 1,00 |
| S3 | 1,00 | 1,00 | 1,00 |
| S4 | 1,00 | 1,00 | 1,00 |
