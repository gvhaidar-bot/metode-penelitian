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

### Hasil eksekusi (2026-10-07, backend lokal, data Kaggle asli)

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
| TC-09 – TC-13 | Verifikasi statis (bukan browser) | Semua link sidebar mengarah ke route yang terdefinisi di App.jsx (tidak ada halaman kosong); production build sukses; engine rekomendasi JS diuji via node (Python+SQL → Data Analyst teratas). Uji klik manual tetap disarankan di laptop. |

## B. Perbandingan Metode (CBF+SAW vs Naive Bayes)

Tujuan: menguji **konsistensi** perangkingan — apakah rekomendasi yang
dihasilkan robust dan tidak hanya kebetulan cocok pada satu metode.
Ini BUKAN uji superioritas: tanpa label ground truth independen,
tidak dapat disimpulkan satu metode "lebih akurat" dari yang lain.

Desain:
1. Kedua metode dijalankan pada dataset profil karier yang sama
   (10 karier di PostgreSQL).
2. Skenario input sama untuk kedua metode: beberapa profil skill
   sintetis (mis. {Python, SQL}, {HTML, CSS, JavaScript}, {PHP})
   dikombinasikan dengan variasi nilai minat.
3. Bandingkan daftar peringkat top-5 yang dihasilkan tiap metode.
   Catatan: Naive Bayes hanya memakai informasi skill (probabilistik),
   sedangkan CBF+SAW memakai empat kriteria — perbedaan hasil yang
   wajar dianalisis, bukan dianggap kegagalan salah satu metode.

Metrik:
- **Overlap@5**: berapa karier yang sama-sama muncul di top-5
  kedua metode.
- **Korelasi peringkat**: Spearman's rho / Kendall's tau antara dua
  daftar peringkat lengkap (10 karier).

Interpretasi: kesepakatan yang tinggi menunjukkan perangkingan
konsisten lintas metode; perbedaan dianalisis secara kualitatif
untuk menjelaskan karakter masing-masing metode. Hasil perbandingan
dilaporkan apa adanya, termasuk ketika kedua metode tidak sepakat.
