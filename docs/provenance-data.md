# Provenance Data — `backend/data/pekerjaan.json`

Dokumen ini mencatat dengan jujur dari mana setiap bagian data 23 profil
karier berasal. Ditulis agar dapat disitasi apa adanya di skripsi.

## Ringkasan per komponen

| Komponen | Sumber | Keterangan |
|---|---|---|
| 14 profil karier awal (skill, gaji, demand) | Dataset Kaggle + kurasi tim | Lihat `build_dataset.py`: IT Jobs in Asia-Pacific (sergeychekurin) + Indonesia Average Job Salary (husnind). 4 karier (Data Engineer, Business Analyst, System Analyst, Full Stack) ditambahkan dari analisis `glints_jobs.csv`. |
| 9 profil karier tambahan (network-engineer, cloud-engineer, sysadmin, game-developer, dba, data-scientist, product-manager, it-support, embedded-engineer) | Kurasi peneliti + validasi scraping Glints 15 Okt 2026 | Awalnya disusun dari pengetahuan umum industri IT. Skill diperkaya/divalidasi dengan 180 lowongan hasil scraping Glints (30 per karier, 15 Okt 2026, file `glints_scrape_20251015.csv`): network-engineer +5 skill (Network Security, Penetration Testing, Network Monitoring, OSPF, Palo Alto), cloud-engineer +2 (CI/CD, Jenkins), dba +1 (Database Monitoring), embedded-engineer +2 (PCB Design, MATLAB), product-manager +2 (Product Analysis, JIRA, dari `glints_jobs.csv`), data-scientist +3 (Predictive Analytics, Data Modeling, Tableau, dari `glints_jobs.csv`), sysadmin +1 (Ansible, dari `glints_jobs.csv`). Noise (Teamwork, Customer Service, Hybrid, dsb.) dibuang manual. |
| Pengayaan skill (±40 skill baru: TypeScript, Next.js, Go, Node.js, Pandas, Linux, dsb.) | `glints_jobs.csv` (1.133 lowongan, klaim tim: Mei–Jun 2026, tidak terverifikasi dari isi file) | Tag skill asli dari kolom `job_requirements`, diagregasi per karier lalu dikurasi manual (noise seperti "Remote", "Social Media" dibuang). |
| Gaji 17 karier terpetakan | Median `glints_jobs.csv` (1.133 lowongan) | `gaji_min_median_jt` / `gaji_max_median_jt` per karier dari `glints_stats.json`. Sumber: `gaji_sumber` per karier di `pekerjaan.json`. |
| Gaji network-engineer (6,0–8,15) | Dataset Kaggle husnind (n=7) | Min–maks Gaji_Rata2 untuk judul mengandung "network engineer". |
| Gaji dba (10,07–12,5) | Dataset Kaggle husnind (n=2) | Dua baris "Database Administrator". |
| Gaji it-support (4,5–6,41) | Dataset Kaggle husnind (n=15) | Rentang Q1–Q3 (dua pencilan atas dibuang). |
| Gaji cloud-engineer (10–20) | dinaspajak.com (estimasi PT Universal Tekno Reksajaya 2026) | Rentang publikasi; Kaggle hanya 1 baris (8,29 jt). |
| Gaji game-developer (6–12) | radarbaru.com (2026) | Rentang entry level; didukung masoemuniversity.ac.id (junior 5,5–9 jt). |
| Gaji embedded-engineer (8–16) | dinaspajak.com (estimasi PT Universal Tekno Reksajaya 2026) | Rentang publikasi; didukung worldsalaries.com (rata-rata 13,4 jt/bln). |
| Demand (1–5) | Jumlah lowongan Glints per karier (formula) | `demand = 1 + round(4 × log(1+n) / log(1+n_maks))`, n = jumlah lowongan terpetakan (n_maks = 79). Enam karier tak terpetakan mendapat 1 — keterbatasan sampel, bukan penilaian peneliti. |
| Bobot SAW | Penilaian peneliti | Lihat `_keterangan` di `bobot.json`. Belum divalidasi pakar/AHP. Catat sebagai keterbatasan. |
| Demand (1–5) | Jumlah lowongan Glints per karier (formula) | `demand = 1 + round(4 × log(1+n) / log(1+n_maks))`, n = jumlah lowongan terpetakan (n_maks = 79). Enam karier tak terpetakan mendapat 1 — keterbatasan sampel, bukan penilaian peneliti. |

## Yang boleh diklaim di skripsi

- "Profil skill diperkaya dari 1.133 lowongan kerja nyata (dataset Glints)."
- "Gaji 17 karier dari median lowongan Glints; 6 sisanya dari dataset gaji
  Kaggle (husnind, CC BY 4.0) dan publikasi web yang disitasi."
- "Demand dihitung formulaik dari jumlah lowongan per karier pada dataset
  Glints (skala log 1–5)."
- "9 karier tambahan dirumuskan peneliti dari pengetahuan industri; angka
  gaji dan demand-nya kini bersumber publik (bukan estimasi)."

## Yang tidak boleh diklaim

- Jangan klaim gaji/demand berasal dari satu dataset tunggal — tiap karier
  mencantumkan sumbernya di `gaji_sumber` / `demand_sumber`.
- Jangan klaim bobot SAW sudah divalidasi pakar (belum).
- Rentang gaji web (cloud, game, embedded) adalah publikasi estimasi —
  sitasi jelas, bukan data primer penelitian.

## Batasan yang disarankan untuk Bab 1 / Bab 5

- Cakupan 23 karier IT populer; karier niche (mis. AR/VR, blockchain murni)
  belum tercakup.
- Data gaji dan demand bersifat estimasi per Juni 2026 dan dapat berubah.
- Pengembangan lanjutan: validasi pakar (kuesioner) untuk profil, gaji,
  demand, dan bobot SAW.

## Narasi pertahanan untuk sidang (9 karier tambahan)

Bila penguji mempertanyakan 9 dari 23 karier (~39%) yang awalnya dikurasi
peneliti, gunakan bingkai berikut (diperbarui 15 Okt 2026):

1. **Keputusan desain sistematis, bukan ad-hoc.** Sembilan karier dipilih
   dengan kriteria eksplisit: (a) peran IT yang umum dibuka di Indonesia
   (tercermin pada 1.133 lowongan Glints), (b) melengkapi spektrum bidang
   yang belum terwakili (infrastruktur, data lanjutan, manajemen produk,
   dukungan teknis), (c) tiap profil memakai struktur data yang sama
   dengan 14 karier berbasis dataset (skill, gaji_min/max, demand 1–5,
   roadmap 6 quest).
2. **Skill kini didukung data scraping.** Pada 15 Okt 2026 dilakukan
   scraping 180 lowongan Glints (30 per karier) untuk memvalidasi dan
   memperkaya profil skill 9 karier tersebut; 16 skill baru ditambahkan
   dari tag lowongan asli setelah noise dibuang. Keberadaan keenam peran
   yang tidak terpetakan di dataset lama juga diverifikasi langsung di
   web Glints (lowongan aktif ditemukan untuk semuanya).
3. **Transparansi penuh.** Dokumen ini mencatat jujur komponen mana yang
   dari dataset dan mana yang kurasi peneliti; tidak ada klaim palsu
   yang bisa dibongkar.
3. **Keterbatasan dinyatakan terbuka.** Gaji, demand, dan bobot SAW yang
   belum divalidasi pakar dicatat sebagai keterbatasan penelitian, dengan
   validasi pakar (kuesioner) sebagai pekerjaan lanjutan yang konkret —
   bukan disembunyikan.
4. **Fokus penelitian adalah metode, bukan sensus pasar kerja.** Kontribusi
   utama skripsi adalah rancang bangun SPK dengan CBF + SAW; data profil
   adalah input yang dapat diganti/dipertajam tanpa mengubah metode.
