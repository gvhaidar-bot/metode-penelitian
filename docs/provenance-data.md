# Provenance Data — `backend/data/pekerjaan.json`

Dokumen ini mencatat dengan jujur dari mana setiap bagian data 23 profil
karier berasal. Ditulis agar dapat disitasi apa adanya di skripsi.

## Ringkasan per komponen

| Komponen | Sumber | Keterangan |
|---|---|---|
| 14 profil karier awal (skill, gaji, demand) | Dataset Kaggle + kurasi tim | Lihat `build_dataset.py`: IT Jobs in Asia-Pacific (sergeychekurin) + Indonesia Average Job Salary (husnind). 4 karier (Data Engineer, Business Analyst, System Analyst, Full Stack) ditambahkan dari analisis `glints_jobs.csv`. |
| 9 profil karier tambahan (network-engineer, cloud-engineer, sysadmin, game-developer, dba, data-scientist, product-manager, it-support, embedded-engineer) | Kurasi peneliti | Disusun dari pengetahuan umum industri IT (daftar skill, estimasi gaji pasar Indonesia, roadmap belajar). **Bukan dari dataset Kaggle/GitHub, bukan hasil scraping.** |
| Pengayaan skill (±40 skill baru: TypeScript, Next.js, Go, Node.js, Pandas, Linux, dsb.) | `glints_jobs.csv` (1.133 lowongan, klaim tim: Mei–Jun 2026, tidak terverifikasi dari isi file) | Tag skill asli dari kolom `job_requirements`, diagregasi per karier lalu dikurasi manual (noise seperti "Remote", "Social Media" dibuang). |
| Gaji 9 karier baru | Estimasi peneliti | Berdasarkan pengetahuan pasar kerja IT Indonesia. Dataset gaji Kaggle (husnind, 32.976 baris) dicek tetapi sampel untuk peran-peran ini terlalu kecil (n=1–8) sehingga tidak dijadikan acuan utama. |
| Demand (1–5) | Penilaian peneliti | Subjektif, belum divalidasi pakar. Catat sebagai keterbatasan. |
| Bobot SAW | Penilaian peneliti | Lihat `_keterangan` di `bobot.json`. Belum divalidasi pakar/AHP. Catat sebagai keterbatasan. |
| Label ketahanan AI (`ai_risk`) | Kurasi peneliti | Informasi tampilan saja, tidak ikut perhitungan. |

## Yang boleh diklaim di skripsi

- "Profil skill diperkaya dari 1.133 lowongan kerja nyata (dataset Glints)."
- "9 karier tambahan dikurasi peneliti berdasarkan pengetahuan industri;
  gaji dan demand merupakan estimasi peneliti."

## Yang tidak boleh diklaim

- Jangan klaim 9 karier baru berasal dari Kaggle/GitHub/scraping.
- Jangan klaim demand/bobot sudah divalidasi pakar (belum).

## Batasan yang disarankan untuk Bab 1 / Bab 5

- Cakupan 23 karier IT populer; karier niche (mis. AR/VR, blockchain murni)
  belum tercakup.
- Data gaji dan demand bersifat estimasi per Juni 2026 dan dapat berubah.
- Pengembangan lanjutan: validasi pakar (kuesioner) untuk profil, gaji,
  demand, dan bobot SAW.
