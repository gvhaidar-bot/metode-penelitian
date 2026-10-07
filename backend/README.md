# Backend — API Rekomendasi Karier IT

## Cara menjalankan

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

API: http://localhost:8000 — dokumentasi otomatis: http://localhost:8000/docs

## Endpoint

| Method | Path              | Keterangan                                  |
|--------|-------------------|---------------------------------------------|
| GET    | `/`               | Cek status API                              |
| GET    | `/pekerjaan`      | Daftar semua profil pekerjaan + roadmap     |
| GET    | `/pekerjaan/{id}` | Detail satu pekerjaan                       |
| POST   | `/rekomendasi`    | Hitung ranking rekomendasi                  |

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
