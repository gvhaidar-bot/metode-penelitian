# Flowchart Sistem Rekomendasi Karier

Simbol: `[ ]` = proses, `< >` = keputusan (decision), `→` = alur.

```
[ MULAI ]
    |
[ Pengguna membuka halaman /rekomendasi ]
    |
[ Pengguna memilih skill yang dimiliki ]
    |
[ Pengguna menilai minat tiap kategori (1-5) ]
    |
[ Pengguna menekan tombol "Dapatkan Rekomendasi" ]
    |
    < Apakah ada skill yang dipilih? >
       | Tidak                | Ya
       |                      |
[ Tampilkan peringatan ]      |
[ kembali ke form ]           |
                              |
                < Apakah backend API terjangkau? >
                   | Ya                      | Tidak
                   |                           |
        [ Kirim POST /rekomendasi ]   [ Hitung dengan mesin lokal (JS) ]
                   |                           |
        < Apakah DATABASE_URL terisi dan PostgreSQL terjangkau? >
           | Ya                          | Tidak
           |                               |
[ Ambil data dari PostgreSQL ]   [ Ambil data dari pekerjaan.json ]
           |                               |
            -------→ [ Untuk setiap pekerjaan: ] ←-------
                     [ hitung cosine similarity antara ]
                     [ skill pengguna vs skill pekerjaan ]
                     [   → metode CBF                 ]
                               |
                     [ Gabungkan 4 kriteria berbobot: ]
                     [ 0,45×skill + 0,25×minat        ]
                     [ + 0,15×gaji + 0,15×demand      ]
                     [   → metode SAW                 ]
                               |
                     [ Urutkan pekerjaan berdasarkan ]
                     [ skor akhir (tertinggi dulu)    ]
                               |
                     [ Ambil 5 karier teratas ]
                               |
                     [ Untuk tiap karier: ambil roadmap ]
                     [ dari basis pengetahuan         ]
                     [   → knowledge-based            ]
                               |
                     [ Tampilkan hasil ke pengguna ]
                               |
                     [ Simpan ke riwayat (localStorage) ]
                               |
                          [ SELESAI ]
```

## Titik keputusan (decision) — wajib ada di flowchart

| # | Keputusan | Jika True (Ya) | Jika False (Tidak) | Lokasi di kode |
|---|-----------|----------------|---------------------|----------------|
| 1 | Apakah ada skill yang dipilih? | Lanjut ke perhitungan | Tampilkan peringatan, kembali ke form | `frontend/src/pages/Rekomendasi.jsx` |
| 2 | Apakah backend API terjangkau? | Hitung via API (`POST /rekomendasi`) | Hitung lokal dengan mesin JS | `frontend/src/api.js` |
| 3 | Apakah PostgreSQL tersedia? | Ambil data dari database | Ambil data dari `pekerjaan.json` | `backend/db.py`, `backend/main.py` |

## Pemetaan metode ke flowchart

- **Content-Based Filtering + Cosine Similarity** → tahap "hitung cosine similarity"
- **SAW** → tahap "gabungkan 4 kriteria berbobot" + "urutkan"
- **Knowledge-based** → tahap "ambil roadmap dari basis pengetahuan"
