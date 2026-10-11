# Activity Diagram — Use Case "Mendapatkan Rekomendasi" (UC-03)

Diagram aktivitas untuk use case inti sistem: dari pengguna menekan tombol
"Dapatkan Rekomendasi" sampai hasil 5 karier teratas ditampilkan dan disimpan
ke riwayat. Cocok diletakkan di BAB 3 setelah use case diagram.

Notasi: `●` = node awal, `⊗` = node akhir, `[ ]` = aksi (action node),
`< >` = keputusan (decision node), `→` = alur.
Partisi (swimlane) kiri–kanan menunjukkan siapa melakukan apa.

```
PARTISI: Pengguna & Frontend            |  PARTISI: Backend (Flask)        |  PARTISI: Sumber data
                                       |                                    |
●                                      |                                    |
|                                      |                                    |
[ Buka halaman /rekomendasi ]          |                                    |
|                                      |                                    |
[ Pilih skill yang dimiliki ]          |                                    |
|                                      |                                    |
[ Nilai minat tiap kategori (1-5) ]    |                                    |
|                                      |                                    |
[ Tekan "Dapatkan Rekomendasi" ]       |                                    |
|                                      |                                    |
< Ada skill yang dipilih? > ---Tidak→ [ Tampilkan peringatan, kembali ke form ] ──→ ⊗
| Ya                                   |
|                                      |                                    |
|      [ Kirim POST /rekomendasi ]       |                                    |
|      {skills, minat, top_n}           |                                    |
|                   |                   |                                    |
|      < Backend API terjangkau? >      |                                    |
|         | Ya                | Tidak     |                                    |
|         |                   |           |                                    |
|         |     [ Tampilkan pesan error:   |                                    |
|         |       "Backend tidak           |                                    |
|         |       terjangkau" ]            |                                    |
|         |                   ⊗           |                                    |
|                           ↓           |                                    |
|                                      | [ Normalisasi skill (huruf kecil) ] |
|                                      |             |                      |
|                                      | < DATABASE_URL terisi dan    |
|                                      |   PostgreSQL terjangkau? >  |
|                                      |   | Ya              | Tidak |
|                                      |   |                 |       |
|                                      |   |   [ Baca backend/data/pekerjaan.json ]
|                                      |   ↓                 ↓       |
|                                      |   [ Muat daftar PEKERJAAN ]
|                                      |             |
|                                      | [ Untuk setiap pekerjaan: ]
|                                      | [  hitung cosine similarity ]
|                                      | [  skill user vs skill job  ]
|                                      | [    → metode CBF (Content- ]
|                                      | [      Based Filtering)      ]
|                                      |             |
|                                      | [ Gabung 4 kriteria berbobot: ]
|                                      | [ 0,45×skill + 0,25×minat    ]
|                                      | [ + 0,15×gaji + 0,15×demand  ]
|                                      | [    → metode SAW             ]
|                                      |             |
|                                      | [ Urutkan skor akhir desc, ]
|                                      | [ ambil top_n (default 5)  ]
|                                      |             |
|              [ Terima hasil JSON {hasil, metode} ] ←───────────────────────
|                            |
|              [ Tampilkan 5 karier teratas + rincian skor per kriteria ]
|                            |
|              [ Simpan ke riwayat (localStorage, maks 20) ]
|                            |
⊗                            |
```

## Pemetaan elemen → kode asli

| Tahap di diagram | Lokasi di kode |
|---|---|
| Validasi "ada skill dipilih?" | `frontend/src/pages/Rekomendasi.jsx` |
| Keputusan "backend terjangkau?" → pesan error bila tidak | `frontend/src/api.js` → `panggil()` |
| Endpoint `GET /meta` (daftar skill & kategori form) | `backend/app.py` → `meta()` |
| Endpoint `POST /rekomendasi` | `backend/app.py` → `rekomendasi()` |
| Normalisasi skill | `backend/app.py` → `normalisasi()` |
| Keputusan "PostgreSQL terjangkau?" | `backend/app.py` (blok try import `db.muat_dari_db`) |
| Cosine similarity | `backend/app.py` → `cosine_similarity()` |
| Skor SAW + bobot | `backend/app.py` → `hitung_skor()` + `BOBOT` |
| Simpan riwayat 20 terakhir | `frontend/src/pages/Rekomendasi.jsx` (localStorage `riwayat-rekomendasi`) |

## Catatan untuk laporan

- Gambar ulang dengan simbol UML standar di draw.io: lingkaran penuh = node
  awal, lingkaran bertarget = node akhir, kotak berujung bulat = aksi,
  belah ketupat = keputusan, garis vertikal tebal = partisi (swimlane).
- Diagram ini fokus ke UC-03. Kalau dosen minta activity diagram untuk
  use case lain (mis. UC-05 melihat roadmap), polanya sama: 1 use case = 1 diagram.
- Sequence diagram (urutan pesan antar komponen) juga bisa dibuat dari
  diagram ini — tinggal pecah tiap aksi menjadi panah pesan antar partisi.
