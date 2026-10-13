# Integrasi Data Glints (`glints_jobs.csv`)

## Sumber data

- File: `backend/data/glints_jobs.csv` (1.133 baris)
- Ditambahkan ke repo: 2026-10-12 oleh Haidar Ali (commit `211db6f5`)
- Klaim commit: "1.133 lowongan Glints Indonesia, Mei-Jun 2026"
- Kolom: job_title, company_name, location, salary_range, job_type,
  experience_level, education_req, job_requirements, posted_date,
  source_platform

**Catatan provenance:** kolom `posted_date` hanya berisi tanggal relatif
("Kemarin", "N hari yang lalu"), bukan tanggal absolut. Klaim "Mei-Jun
2026" tidak dapat diverifikasi dari isi file — untuk keperluan skripsi,
siapkan bukti pendukung (tanggal scraping / script scraper) bila dosen
menanyakan.

## Pemetaan ke 10 karier

`backend/glints.py` memetakan tiap lowongan ke id karier di
`pekerjaan.json` dengan dua tahap:

1. **Kata kunci judul** — pola regex pada `job_title`
   (mis. `front[\s-]?end`, `flutter`, `devops`, `\bqa\b`).
2. **Petunjuk skill** — untuk judul generik seperti "Software Engineer",
   pola dicocokkan pada `job_requirements`
   (mis. `react` -> frontend-dev, `laravel` -> backend-dev).

Hasil pemetaan (dihasilkan `backend/data/build_glints.py`):

| Karier | Lowongan | Median gaji (jt) |
|---|---|---|
| data-analyst | 86 | 5,0–6,0 |
| backend-dev | 68 | 5,6–7,5 |
| frontend-dev | 61 | 6,0–7,8 |
| it-pm | 57 | 8,0–12,0 |
| qa-engineer | 49 | 6,3–8,0 |
| uiux-designer | 49 | 4,0–5,5 |
| mobile-dev | 47 | 6,9–9,0 |
| ml-engineer | 36 | 6,0–8,0 |
| devops-engineer | 34 | 8,0–12,0 |
| security-analyst | 11 | 4,0–6,0 |
| Tak terpetakan | 635 | — |

Total terpetakan: 498 dari 1.133 (44%). Yang tak terpetakan umumnya
berjudul generik tanpa petunjuk skill yang jelas di requirements.

Statistik tersimpan di `backend/data/glints_stats.json`. Untuk
menghasilkan ulang:

```bash
cd backend
python data/build_glints.py
```

## Penggunaan di aplikasi

- **API:** `GET /pekerjaan/{id}/lowongan` — 5 contoh lowongan yang
  terpetakan ke karier tersebut + total + sumber data.
- **UI:** halaman Roadmap menampilkan bagian "Lowongan terkait di Glints"
  di bawah timeline belajar.
- Profil karier operasional (`pekerjaan.json`) **tidak diubah** — data
  Glints dipakai sebagai pelengkap (bukti lowongan nyata), bukan untuk
  mengkalibrasi ulang bobot/gaji, agar contoh perhitungan manual di
  `docs/contoh-perhitungan.md` tetap valid.
