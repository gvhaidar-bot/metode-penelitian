# Frontend — Sistem Rekomendasi Karier IT

React 19 + Vite + Tailwind CSS + React Router. Terhubung ke backend Flask
via REST API (lihat `../backend/README.md`).

## Cara menjalankan

```bash
cd frontend
npm install
npm run dev
```

Buka http://localhost:5173, daftar akun, lalu masuk.

Backend harus jalan di http://localhost:8000 (atau set `VITE_API_URL`
di file `.env`, contoh: `VITE_API_URL=https://api.contoh.id`).

## Halaman

| Route | Keterangan | Butuh login |
|---|---|---|
| `/` | Masuk / daftar akun | — |
| `/dashboard` | Ringkasan + rekomendasi terakhir | Ya |
| `/rekomendasi` | Pilih skill + urutkan minat → ranking karier | Ya |
| `/roadmap` | Roadmap belajar per karier (quest checklist) | Ya |
| `/skill` | Skill Saya: cari, pilih, dan usulkan skill | Ya |
| `/riwayat` | Riwayat rekomendasi (tersimpan di akun, server-side) | Ya |

## Build produksi

```bash
npm run build   # hasil di frontend/dist/
npm run lint    # cek ESLint
```
