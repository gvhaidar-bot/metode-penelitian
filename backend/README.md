# Backend — API Rekomendasi Karier IT

## Cara menjalankan

```bash
cd backend
pip install -r requirements.txt
python app.py
```

API: http://localhost:8000

Variabel environment (opsional):

| Variabel | Default | Keterangan |
|---|---|---|
| `PORT` | `8000` | Port server |
| `FLASK_DEBUG` | _(kosong)_ | Isi `1` untuk debug mode (hanya dev lokal!) |
| `CORS_ORIGINS` | `http://localhost:5173` | Origin frontend, pisah koma bila >1 |
| `DATABASE_URL` | _(kosong)_ | Contoh `postgresql+psycopg2://postgres:pw@localhost/karier_it`; bila kosong/gagal, otomatis memakai `data/pekerjaan.json` |

## Endpoint

| Method | Path | Auth | Keterangan |
|---|---|---|---|
| GET | `/` | — | Cek status API |
| GET | `/meta` | — | Daftar skill & kategori untuk form frontend |
| GET | `/pekerjaan` | — | Daftar semua profil pekerjaan + roadmap |
| GET | `/pekerjaan/{id}` | — | Detail satu pekerjaan |
| GET | `/pekerjaan/{id}/roadmap` | — | Roadmap belajar satu pekerjaan |
| POST | `/auth/register` | — | Daftar: `{name, email, password}` → `{token, user}` |
| POST | `/auth/login` | — | Masuk: `{email, password}` → `{token, user}` |
| GET | `/auth/me` | Bearer | Info user dari token |
| POST | `/auth/logout` | Bearer | Cabut token |
| POST | `/rekomendasi` | Bearer | Hitung ranking rekomendasi |

Contoh body `POST /rekomendasi` (header `Authorization: Bearer <token>`):

```json
{
  "skills": ["HTML", "CSS", "JavaScript"],
  "minat": { "Web": 5, "Mobile": 3, "Data & AI": 2, "Infrastruktur & Keamanan": 2, "Desain & Manajemen": 4 },
  "top_n": 5
}
```

## Metode

1. **Content-Based Filtering + Cosine Similarity** — kecocokan skill user
   terhadap profil skill tiap pekerjaan. Keterbatasan: skill diperlakukan
   biner (dikuasai/tidak) tanpa level penguasaan.
2. **SAW** — skor akhir = w1 × skill + w2 × minat + w3 × gaji + w4 × demand.
   Bobot dibaca dari `data/bobot.json` (total harus = 1); ubah file itu
   untuk eksperimen sensitivitas tanpa menyentuh kode.

Data profil pekerjaan: `data/pekerjaan.json` (10 karier IT). Pengguna
tersimpan di `data/users.json` (password ter-hash, dibuat otomatis).

## Test otomatis

```bash
pytest -q
```

14 test: TC-01..TC-08 rencana pengujian, 2 skenario relevansi, 4 test auth.

## Kebutuhan olah data (opsional)

`requirements-data.txt` hanya untuk `data/build_dataset.py` (pandas, kaggle,
SQLAlchemy, psycopg2) — tidak dibutuhkan untuk menjalankan API.
