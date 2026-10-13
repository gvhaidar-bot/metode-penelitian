# Contoh Perhitungan: Cosine Similarity + SAW (Simulasi Kecil)

Simulasi manual memakai data asli `backend/data/pekerjaan.json`
(branch `newest`). Tujuannya menunjukkan cara kerja dua metode inti
sistem langkah demi langkah.

## Data contoh

**Profil user:**
- Skill: {Python, SQL}
- Minat (skala 1–5): Data & AI = 5, Web = 3, Mobile = 3,
  Infrastruktur & Keamanan = 3, Desain & Manajemen = 3

**Dua pekerjaan pembanding:**

| Pekerjaan | Kategori | Jumlah skill | Gaji maks (jt) | Demand (1–5) |
|---|---|---|---|---|
| Data Analyst | Data & AI | 11 | 6,8 | 1 |
| Frontend Developer | Web | 12 | 9,1 | 3 |

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
- cos = 0 / (√2 × √12) = **0,0000**

## Langkah 2 — SAW (4 kriteria, semua benefit)

Normalisasi baku kriteria benefit: `r = x / max(x)`.

**Data Analyst:**
- r_skill = 0,4264 (dari Langkah 1)
- r_minat = 5/5 = 1,0000 (kategori Data & AI)
- r_gaji = 6,8/14,1 = 0,4823
- r_demand = 1/5 = 0,2000

**Frontend Developer:**
- r_skill = 0,0000
- r_minat = 3/5 = 0,6000 (kategori Web)
- r_gaji = 9,1/14,1 = 0,6454
- r_demand = 3/5 = 0,6000

## Langkah 3 — Nilai preferensi & ranking

`V = 0,45×r_skill + 0,25×r_minat + 0,15×r_gaji + 0,15×r_demand`

**Data Analyst:**
V = 0,45×0,4264 + 0,25×1,0000 + 0,15×0,4823 + 0,15×0,2000
  = 0,1919 + 0,2500 + 0,0723 + 0,0300 = **0,5442**

**Frontend Developer:**
V = 0,45×0,0000 + 0,25×0,6000 + 0,15×0,6454 + 0,15×0,6000
  = 0,0000 + 0,1500 + 0,0968 + 0,0900 = **0,3368**

**Ranking:** 1. Data Analyst (0,5442) > 2. Frontend Developer (0,3368).

Hasil ini konsisten dengan ekspektasi: user yang menguasai Python+SQL
dan berminat tinggi di bidang data memang paling cocok menjadi
Data Analyst. Skenario ini juga dipakai sebagai test otomatis
`test_relevansi_python_sql_masuk_top3` di `backend/tests/test_api.py`.

## Catatan

Perhitungan di atas dapat direproduksi persis oleh endpoint
`POST /rekomendasi` (butuh token login) — bandingkan `skor_akhir`
pada respons JSON dengan nilai V di sini.
