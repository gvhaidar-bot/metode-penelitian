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

## B. Evaluasi Relevansi Rekomendasi

Tujuan: menguji apakah rekomendasi yang dihasilkan sistem **masuk akal
secara domain**, bukan sekadar berjalan tanpa error. Seluruh evaluasi
memakai data sekunder — tanpa kuesioner.

Desain (scenario-based, label relevansi ditetapkan peneliti dengan dasar
yang jelas):
1. Susun 3–4 profil user sintetis, mis.:
   - {Python, SQL} + minat tinggi bidang Data → ekspektasi: Data Analyst /
     ML Engineer di top-3 (dasar: 5 tools teratas lowongan riil 2025).
   - {HTML, CSS, JavaScript} → ekspektasi: Frontend Developer teratas.
   - {PHP, Laravel} → ekspektasi: Backend / Mobile Developer di top-3.
2. Jalankan tiap skenario via POST /rekomendasi, catat top-5.
3. Hitung **hit@3**: apakah karier ekspektasi muncul di 3 teratas.

Interpretasi: dilaporkan apa adanya per skenario; skenario yang meleset
dianalisis penyebabnya (profil skill? bobot? data gaji/demand?).

## C. Analisis Sensitivitas Bobot SAW

Tujuan: menguji seberapa stabil ranking terhadap pilihan bobot, sekaligus
menjawab kebutuhan justifikasi bobot (lihat bab3 3.4).

Desain: untuk skenario input yang sama, bandingkan ranking pada beberapa
kombinasi bobot (total = 1):
- Baseline: 0,45 / 0,25 / 0,15 / 0,15 (skill/minat/gaji/demand)
- Skill-heavy: 0,60 / 0,20 / 0,10 / 0,10
- Seimbang: 0,25 / 0,25 / 0,25 / 0,25
- Minat-heavy: 0,25 / 0,45 / 0,15 / 0,15

Metrik: overlap@5 antara ranking baseline dan tiap varian.
Interpretasi: ranking yang stabil di semua varian = robust; yang berubah
drastis = sensitif terhadap bobot → perlu justifikasi/validasi lebih kuat.
