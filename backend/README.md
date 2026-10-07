# Backend — API Rekomendasi Karier IT

## Cara menjalankan

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

API: http://localhost:8000 — dokumentasi otomatis: http://localhost:8000/docs

## Endpoint

| Method | Path                          | Keterangan                                  |
|--------|-------------------------------|---------------------------------------------|
| GET    | `/`                           | Cek status API                              |
| GET    | `/pekerjaan`                  | Daftar semua profil pekerjaan + roadmap     |
| GET    | `/pekerjaan/{id}`             | Detail satu pekerjaan                       |
| GET    | `/pekerjaan/{id}/roadmap`     | Roadmap belajar satu pekerjaan              |
| POST   | `/rekomendasi`                | Hitung ranking rekomendasi                  |

Contoh body `POST /rekomendasi`:

```json
{
  "skills": ["HTML", "CSS", "JavaScript"],
  "minat": { "Web": 5, "Mobile": 3, "Data & AI": 2, "Infrastruktur & Keamanan": 2, "Desain & Manajemen": 4 },
  "top_n": 5
}
```

## Metode

1. **Content-Based Filtering + Cosine Similarity** — kecocokan skill user
   terhadap profil skill tiap pekerjaan.
2. **SAW** — skor akhir = 0.45 × skill + 0.25 × minat + 0.15 × gaji + 0.15 × demand.

Data profil pekerjaan: `data/pekerjaan.json` (10 karier IT, data contoh untuk
pengembangan — nanti diganti hasil olahan dataset Kaggle).

## Database PostgreSQL (opsional)

1. Buat database lalu jalankan `schema.sql`:
   ```sql
   CREATE DATABASE karier_it;
   -- lalu: psql -d karier_it -f backend/schema.sql
   ```
2. Isi environment variable:
   ```bash
   export DATABASE_URL="postgresql+psycopg2://postgres:password@localhost/karier_it"
   ```
   (ganti `postgres:password` dengan user & password PostgreSQL-mu)
3. Seed data awal dari JSON:
   ```bash
   python3 db.py
   ```
4. Jalankan API seperti biasa — bila `DATABASE_URL` terisi dan PostgreSQL
   terjangkau, data diambil dari database; bila tidak, otomatis fallback
   ke `pekerjaan.json`.

## Pipeline dataset Kaggle

`data/build_dataset.py` mengunduh (butuh kredensial Kaggle), memfilter
lowongan Indonesia, memetakan judul ke 10 karier, mengagregasi skill,
menggabungkan data gaji, lalu menulis ulang `pekerjaan.json` + ringkasan EDA:

```bash
cd backend/data
python3 build_dataset.py --download   # butuh `kaggle` CLI + login Kaggle
python3 build_dataset.py              # pakai CSV yang sudah ada di data/raw/
```
