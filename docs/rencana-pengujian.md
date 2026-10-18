# Rencana Pengujian

## A. Black-Box Testing (fungsional)

| ID | Fitur | Skenario | Input | Hasil yang diharapkan |
|----|-------|----------|-------|----------------------|
| TC-01 | POST /rekomendasi | Input valid | skills=[Python, SQL], minat ranking 5 kategori, top_n=5 | 200, 5 hasil terurut skor menurun |
| TC-02 | POST /rekomendasi | Tanpa skill, profil kosong | skills=[], minat ranking 5 kategori | 400, pesan "isi dulu skill" |
| TC-02b | POST /rekomendasi | Skill dari profil | PUT /profil dulu, lalu skills=[] | 200, 5 hasil |
| TC-03 | POST /rekomendasi | top_n=3 | skills=[HTML], top_n=3 | Tepat 3 hasil |
| TC-04 | POST /rekomendasi | Body kosong | {} | 400 (minat tidak valid) |
| TC-04b | POST /rekomendasi | Minat tidak lengkap | skills=[Python], minat hanya 3 kategori | 400, pesan "Urutkan kelima kategori minat" |
| TC-05 | GET /pekerjaan | Daftar pekerjaan | — | 200, 23 item berisi skills & roadmap |
| TC-06 | GET /pekerjaan/{id} | ID valid | data-analyst | 200, detail + roadmap 6 quest |
| TC-07 | GET /pekerjaan/{id} | ID tidak ada | tidak-ada | 404 |
| TC-08 | GET /pekerjaan/{id}/roadmap | Roadmap valid | mobile-dev | 200, list quest berurutan |
| TC-09 | Halaman Rekomendasi | Alur penuh | Isi skill, urutkan 5 kategori minat, klik tombol | Kartu hasil tampil + rincian skor + tombol Roadmap |
| TC-10 | Halaman Rekomendasi | Tanpa skill | Profil kosong, klik tombol | Pesan error jelas, tidak crash |
| TC-11 | Halaman Riwayat | Simpan otomatis | Selesai 1 rekomendasi | Entri muncul di /riwayat (server) |
| TC-12 | Halaman Roadmap | Pilih karier | Klik karier | Quest berubah + checkbox tersimpan |
| TC-13 | Navigasi | Semua menu sidebar | Klik tiap menu | Tidak ada halaman kosong |
| TC-14 | PUT /profil | Simpan skill | skills=[Python, SQL] | 200, skill tersimpan |
| TC-15 | PUT /profil | Skill kustom | skills=["Skill Baru"] | 200, diterima |
| TC-16 | GET /skills | Cari skill | ?q=pyth | 200, berisi Python |
| TC-17 | POST /quest | Tandai quest | karier valid, langkah 0 | 200, progres bertambah |
| TC-18 | GET /quest | Progress | — | 200, persen per karier |

Status tiap TC diisi saat pengujian: Lolos / Gagal + catatan.

### Hasil eksekusi (2026-10-18, versi database-only 23 karier + login wajib)

Backend pytest: 29/29 lolos (TC-01..TC-08, TC-02b, TC-04b, TC-14..TC-18,
autentikasi, lowongan Glints, relevansi, ROC).

Uji klik manual TC-09–TC-13 oleh peneliti (18 Okt 2026, laptop,
PostgreSQL lokal + Flask :8000 + Vite :5173):

| ID | Status | Catatan |
|----|--------|---------|
| TC-09 | Lolos | Input Python+SQL, minat Data & AI peringkat 1 → 5 kartu terurut, Peringkat 1 Data Analyst 50% (Skill 43%, Minat 46%, Gaji 30%, Demand 100%), tombol "Lihat detail skill" + link "Lihat Roadmap", tanpa error |
| TC-10 | Lolos | Profil dikosongkan → pesan "Isi dulu skill di halaman Skill Saya sebelum menghitung.", tanpa kartu hasil, tanpa crash; skill dipulihkan (Python, SQL) |
| TC-11 | Lolos | Setelah 1 rekomendasi, entri riwayat bertambah 1 (6→7); entri terbaru cocok (waktu, Skill: Python, SQL, 3 besar); SELECT count(*) FROM riwayat = 7 = jumlah di halaman |
| TC-12 | Lolos | Ganti karier → quest berubah; centang langkah pertama → progres bertambah + tercoret; refresh (F5) → tetap tersimpan; dikembalikan (uncheck) |
| TC-13 | Lolos | 5 menu sidebar tampil berisi; Keluar → halaman masuk; login kembali berhasil |

### Hasil eksekusi (2026-10-13, rebuild: ranking minat + quest + profil server-side)

Backend pytest: 26/26 lolos (TC-01..TC-08, TC-02b, TC-04b, TC-14..TC-18,
autentikasi, lowongan Glints, relevansi).

| ID | Status | Catatan |
|----|--------|---------|
| TC-01 | Lolos | 5 hasil, terurut menurun |
| TC-02 | Lolos | 400 + pesan jelas bila profil kosong |
| TC-04b | Lolos | Minat total 70 → 400 |
| TC-05 | Lolos | 14 item |
| TC-14..TC-18 | Lolos | Profil, pencarian skill, quest, riwayat server-side |

### Hasil eksekusi lama (2026-10-07, backend lokal, data Kaggle asli)

> Catatan: hasil di bawah memakai model minat skala 1-5 yang sudah
> diganti ranking 5 kategori minat (tanpa angka) pada rebuild 2026-10-13. Disimpan sebagai
> arsip.

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
