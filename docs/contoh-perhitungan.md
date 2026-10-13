# Contoh Perhitungan: Cosine Similarity + SAW (Simulasi Kecil)

Simulasi manual memakai data asli `backend/data/pekerjaan.json`
(branch `newest`). Tujuannya menunjukkan cara kerja dua metode inti
sistem langkah demi langkah.

Metode penelitian tetap dua: Content-Based Filtering dan SAW.
Teknik Rank Order Centroid (ROC) di bawah ini BUKAN metode ketiga;
ia hanya cara mengubah urutan prioritas minat user menjadi bobot
kriteria "minat" di dalam langkah SAW (SAW sendiri tidak menentukan
cara bobot diperoleh, hanya memakainya).

## Data contoh

**Profil user:**
- Skill: {Python, SQL}
- Minat (ranking kategori, tanpa angka, paling diminati dulu):
  1. Data & AI
  2. Web
  3. Mobile
  4. Infrastruktur & Keamanan
  5. Desain & Manajemen

User tidak menginput angka sama sekali; ia hanya mengurutkan lima
kategori dari yang paling diminati. Urutan ini dikonversi menjadi
bobot dengan Rank Order Centroid (Barron & Barrett):

`w_i = (1/n) * jumlah(1/k untuk k = i..n)`, dengan n = 5.

| Peringkat | Kategori | Bobot ROC |
|---|---|---|
| 1 | Data & AI | (1 + 1/2 + 1/3 + 1/4 + 1/5)/5 = **0,4567** |
| 2 | Web | (1/2 + 1/3 + 1/4 + 1/5)/5 = **0,2567** |
| 3 | Mobile | (1/3 + 1/4 + 1/5)/5 = **0,1567** |
| 4 | Infrastruktur & Keamanan | (1/4 + 1/5)/5 = **0,0900** |
| 5 | Desain & Manajemen | (1/5)/5 = **0,0400** |

Total bobot = 1,0000. Bobot kategori inilah yang menjadi nilai
kriteria "minat" tiap pekerjaan dalam SAW.

**Dua pekerjaan pembanding:**

| Pekerjaan | Kategori | Jumlah skill | Gaji maks (jt) | Demand (1–5) |
|---|---|---|---|---|
| Data Analyst | Data & AI | 11 | 6,8 | 1 |
| Frontend Developer | Web | 8 | 9,1 | 4 |

Gaji maks seluruh dataset: 14,1 jt.
Bobot SAW (`backend/data/bobot.json`): skill 0,45, minat 0,25,
gaji 0,15, demand 0,15.

## Langkah 1 — Content-Based Filtering (Cosine Similarity)

Rumus: `cos(A,B) = |A ∩ B| / (√|A| × √|B|)`

**Data Analyst:**
- Irisan skill user ∩ skill pekerjaan = {Python, SQL} → 2
- |Skill user| = 2, |Skill pekerjaan| = 11
- cos = 2 / (√2 × √11) = 2 / 4,6904 = **0,4264**

**Frontend Developer:**
- Irisan = {} → 0
- cos = 0 / (√2 × √8) = **0,0000**

## Langkah 2 — SAW (4 kriteria, semua benefit)

Normalisasi baku kriteria benefit: `r = x / max(x)`.
Untuk minat, `r` langsung memakai bobot ROC kategori pekerjaan
(user menaruh Data & AI di peringkat 1, Web di peringkat 2).

**Data Analyst:**
- r_skill = 0,4264 (dari Langkah 1)
- r_minat = 0,4567 (Data & AI peringkat 1)
- r_gaji = 6,8/14,1 = 0,4823
- r_demand = 1/5 = 0,2000

**Frontend Developer:**
- r_skill = 0,0000
- r_minat = 0,2567 (Web peringkat 2)
- r_gaji = 9,1/14,1 = 0,6454
- r_demand = 4/5 = 0,8000

## Langkah 3 — Nilai preferensi & ranking

`V = 0,45×r_skill + 0,25×r_minat + 0,15×r_gaji + 0,15×r_demand`

**Data Analyst:**
V = 0,45×0,4264 + 0,25×0,4567 + 0,15×0,4823 + 0,15×0,2000
  = 0,1919 + 0,1142 + 0,0723 + 0,0300 = **0,4084**

**Frontend Developer:**
V = 0,45×0,0000 + 0,25×0,2567 + 0,15×0,6454 + 0,15×0,8000
  = 0,0000 + 0,0642 + 0,0968 + 0,1200 = **0,2810**

**Ranking:** 1. Data Analyst (0,4084) > 2. Frontend Developer (0,2810).

Hasil ini konsisten dengan ekspektasi: user yang menguasai Python+SQL
dan menaruh Data & AI di peringkat minat teratas memang paling cocok
menjadi Data Analyst.

## Catatan

Perhitungan di atas dapat direproduksi persis oleh endpoint
`POST /rekomendasi` (butuh token login) dengan body:
`{"skills": ["Python", "SQL"], "minat": ["Data & AI", "Web", "Mobile",
"Infrastruktur & Keamanan", "Desain & Manajemen"]}`.
Bandingkan `skor_akhir` pada respons JSON dengan nilai V di sini.
