# Rencana Pengujian

## A. Black-Box Testing (fungsional)

| ID | Fitur | Skenario | Input | Hasil yang diharapkan |
|----|-------|----------|-------|----------------------|
| TC-01 | POST /rekomendasi | Input valid | skills=[Python, SQL], minat lengkap, top_n=5 | 200, 5 hasil terurut skor menurun |
| TC-02 | POST /rekomendasi | Tanpa skill | skills=[], minat lengkap | 200, ranking tetap keluar (dari minat+gaji+demand) |
| TC-03 | POST /rekomendasi | top_n=3 | skills=[HTML], top_n=3 | Tepat 3 hasil |
| TC-04 | POST /rekomendasi | Body kosong | {} | 200, hasil default (minat netral=3) |
| TC-05 | GET /pekerjaan | Daftar pekerjaan | — | 200, 10 item berisi skills & roadmap |
| TC-06 | GET /pekerjaan/{id} | ID valid | data-analyst | 200, detail + roadmap 6 langkah |
| TC-07 | GET /pekerjaan/{id} | ID tidak ada | tidak-ada | 404 |
| TC-08 | GET /pekerjaan/{id}/roadmap | Roadmap valid | mobile-dev | 200, list langkah berurutan |
| TC-09 | Halaman Rekomendasi | Alur penuh | Pilih 3 skill, geser minat, klik tombol | Kartu hasil tampil + skor + tombol Roadmap |
| TC-10 | Halaman Rekomendasi | Tanpa skill | Langsung klik tombol | Tombol nonaktif / tidak error |
| TC-11 | Halaman Riwayat | Simpan otomatis | Selesai 1 rekomendasi | Entri muncul di /riwayat |
| TC-12 | Halaman Roadmap | Pilih karier | Klik chip karier | Timeline langkah berubah sesuai karier |
| TC-13 | Navigasi | Semua menu sidebar | Klik tiap menu | Tidak ada halaman kosong |

Status tiap TC diisi saat pengujian: Lolos / Gagal + catatan.

### Hasil eksekusi (2026-10-07, backend FastAPI lokal, data Kaggle asli)

| ID | Status | Catatan |
|----|--------|---------|
| TC-01 | Lolos | 5 hasil, terurut menurun, teratas: Data Analyst (skor 0,815) |
| TC-02 | Lolos | Tanpa skill tetap mengembalikan 5 hasil (dari minat+gaji+demand) |
| TC-03 | Lolos | Tepat 3 hasil |
| TC-04 | Lolos | Body kosong → 5 hasil default (minat netral=3) |
| TC-05 | Lolos | 10 item, semua berisi skills & roadmap |
| TC-06 | Lolos | Detail + 6 langkah roadmap |
| TC-07 | Lolos | 404 sesuai harapan |
| TC-08 | Lolos | 6 langkah roadmap |
| TC-09 – TC-13 | Belum | Butuh browser (frontend); dijalankan manual |

## B. Kuesioner Kepuasan Pengguna (Skala Likert 1–5)

Responden: mahasiswa Informatika (target ±30 orang).
Skala: 1=Sangat Tidak Setuju … 5=Sangat Setuju.

1. Sistem mudah digunakan tanpa panduan. 
2. Hasil rekomendasi sesuai dengan skill yang saya masukkan. 
3. Informasi gaji dan kebutuhan pasar membantu saya memutuskan. 
4. Roadmap belajar yang diberikan jelas dan dapat diikuti. 
5. Tampilan sistem menarik dan mudah dipahami. 
6. Sistem membantu saya mengenal pilihan karier di bidang IT. 
7. Saya akan merekomendasikan sistem ini ke teman. 
8. Secara keseluruhan saya puas dengan sistem ini. 

Analisis: hitung rata-rata skor per pernyataan dan total; interpretasi
misalnya rata-rata ≥ 4,0 = kategori "Baik/Sangat Baik".
