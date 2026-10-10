# Panduan PostgreSQL di Laptop (Windows)

Langkah ini dijalankan di laptop masing-masing.

## 1. Install PostgreSQL
1. Unduh installer di [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)
   — pilih versi **18.x (stabil)**. PostgreSQL 19 masih pra-rilis (RC1 15 Okt 2026,
   GA 29 Okt 2026), jadi jangan install versi 19 untuk project ini.
2. Jalankan installer, catat **password** yang kamu isi untuk user `postgres`
3. Centang komponen default saja (PostgreSQL Server, pgAdmin) → Install

## 2. Buat database & tabel
1. Buka **pgAdmin** (atau SQL Shell `psql`)
2. Buat database baru bernama `karier_it`
3. Jalankan isi file `backend/schema.sql` di database tersebut:
   - pgAdmin: buka Query Tool → tempel isi schema.sql → Execute
   - atau via terminal: `psql -U postgres -d karier_it -f backend/schema.sql`

## 3. Install dependency backend
```bash
cd backend
pip install -r requirements.txt
```

## 4. Seed data awal
```bash
set DATABASE_URL=postgresql+psycopg2://postgres:PASSWORD@localhost/karier_it
python db.py
```
Ganti `PASSWORD` dengan password PostgreSQL-mu. Di PowerShell:
`$env:DATABASE_URL="postgresql+psycopg2://postgres:PASSWORD@localhost/karier_it"`

## 5. Jalankan backend
```bash
set DATABASE_URL=postgresql+psycopg2://postgres:PASSWORD@localhost/karier_it
flask --app app run --debug --port 8000
```
Buka http://localhost:8000/pekerjaan untuk mencoba endpoint.

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
  (mode fallback) — tetap bisa jalan tanpa PostgreSQL.
- Setelah data Kaggle baru diolah (`python data/build_dataset.py`),
  ulangi langkah 4 untuk refresh isi database.
