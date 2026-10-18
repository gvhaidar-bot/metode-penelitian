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

## Pemetaan ke 23 karier

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
| data-analyst | 79 | 5,0–6,0 |
| frontend-dev | 74 | 5,0–6,5 |
| qa-engineer | 49 | 6,3–8,0 |
| uiux-designer | 49 | 4,0–5,5 |
| backend-dev | 47 | 6,9–10,0 |
| mobile-dev | 45 | 7,0–9,5 |
| fullstack-dev | 57 | 5,0–7,0 |
| devops-engineer | 34 | 8,0–12,0 |
| it-pm | 34 | 8,0–12,0 |
| product-manager | 35 | 5,6–9,0 |
| business-analyst | 32 | 7,05–10,5 |
| data-engineer | 26 | 7,0–10,0 |
| ml-engineer | 26 | 6,5–8,0 |
| security-analyst | 11 | 4,0–6,0 |
| system-analyst | 10 | 5,5–7,75 |
| data-scientist | 8 | 5,85–8,3 |
| sysadmin | 3 | 3,75–5,5 |
| Tak terpetakan | 514 | — |

Total terpetakan: 619 dari 1.133 (55%). Yang tak terpetakan umumnya
berjudul generik tanpa petunjuk skill yang jelas di requirements.

> **Pembaruan pemetaan (2026-10-18).** Ditambah: fallback judul
> generik ("software engineer/developer" → fullstack-dev, dicek
> setelah pola spesifik dan tebakan skill agar bukti spesifik selalu
> menang), "website developer" → frontend-dev, "product analyst" →
> product-manager. Hasil: +22 terpetakan (619), tanpa satu pun
> lowongan lama yang pindah karier. Median gaji di tabel ini adalah
> statistik teramati dari pemetaan saat ini; nilai gaji di
> `pekerjaan.json` adalah nilai kurasi yang dipertahankan stabil
> (tidak dihitung ulang tiap perubahan pemetaan).

Statistik dihitung dari tabel `lowongan_glints` di PostgreSQL. Untuk
menghitung ulang:

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
