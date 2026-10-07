# Panduan MySQL di Laptop (XAMPP)

Langkah ini dijalankan di laptop masing-masing (tidak bisa dari server).

## 1. Aktifkan MySQL
1. Buka **XAMPP Control Panel** → klik **Start** pada MySQL.
2. Klik **Admin** pada baris MySQL → phpMyAdmin terbuka di browser.

## 2. Buat database & tabel
1. Di phpMyAdmin, klik **New** → nama database `karier_it` → **Create**.
2. Klik tab **SQL**, salin seluruh isi file `backend/schema.sql` dari repo,
   tempel, lalu klik **Go**. Tiga tabel (`pekerjaan`, `pekerjaan_skill`,
   `roadmap`) akan terbentuk.

## 3. Install dependency backend
```bash
cd backend
pip install -r requirements.txt
```

## 4. Seed data awal
```bash
set DATABASE_URL=mysql+pymysql://root:@localhost/karier_it
python db.py
```
(Kalau MySQL XAMPP-mu pakai password root, ganti `@localhost` menjadi
`:passwordmu@localhost`. Di PowerShell pakai `$env:DATABASE_URL="..."`.)

## 5. Jalankan backend
```bash
set DATABASE_URL=mysql+pymysql://root:@localhost/karier_it
uvicorn main:app --reload
```
Buka http://localhost:8000/docs untuk mencoba endpoint.

## 6. Jalankan frontend
```bash
cd frontend
npm install
npm run dev
```
Buka http://localhost:5173 — frontend otomatis memakai backend bila
berjalan (atau mode demo bila tidak).

## Catatan
- Tanpa `DATABASE_URL`, backend otomatis memakai `pekerjaan.json`
  (mode fallback) — tetap bisa jalan tanpa MySQL.
- Setelah data Kaggle baru diolah (`python data/build_dataset.py`),
  ulangi langkah 4 untuk refresh isi database.
