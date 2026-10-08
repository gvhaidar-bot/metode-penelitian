# Use Case Diagram — Sistem Rekomendasi Karier

## Aktor

| Aktor | Deskripsi |
|-------|-----------|
| **Mahasiswa** (Pengguna) | Pengguna utama sistem. Memilih skill, menilai minat, menerima rekomendasi karier, melihat roadmap, dan riwayat. |

> Catatan: sistem saat ini tidak memiliki peran Admin — seluruh fitur
> berorientasi pada pengguna akhir (mahasiswa).

## Daftar Use Case

| ID | Use Case | Deskripsi |
|----|----------|-----------|
| UC-01 | Memilih skill | Pengguna memilih skill yang dimiliki dari daftar |
| UC-02 | Menilai minat | Pengguna memberi nilai 1–5 untuk tiap kategori karier |
| UC-03 | Mendapatkan rekomendasi | Sistem menghitung (CBF + SAW) dan menampilkan 5 karier teratas |
| UC-04 | Melihat detail pekerjaan | Pengguna melihat profil lengkap suatu karier (skill, gaji, demand) |
| UC-05 | Melihat roadmap belajar | Pengguna melihat tahapan belajar untuk karier tertentu |
| UC-06 | Melihat riwayat | Pengguna melihat 20 rekomendasi terakhir (tersimpan lokal) |
| UC-07 | Melihat dashboard | Pengguna melihat ringkasan statistik di halaman utama |

## Diagram (teks)

```
                    +-------------------------------+
                    |   Sistem Rekomendasi Karier   |
                    |                               |
  Mahasiswa ------> |  UC-01 Memilih skill          |
   (aktor)          |  UC-02 Menilai minat          |
                    |  UC-03 Mendapatkan rekomendasi|
                    |  UC-04 Melihat detail pekerjaan
                    |  UC-05 Melihat roadmap belajar|
                    |  UC-06 Melihat riwayat        |
                    |  UC-07 Melihat dashboard      |
                    +-------------------------------+
```

## Relasi antar use case

- **UC-03 include UC-01 & UC-02** — rekomendasi membutuhkan input skill dan minat
- **UC-05 extend UC-04** — roadmap diakses dari halaman detail pekerjaan
  (atau langsung dari hasil rekomendasi)

## Keterangan untuk laporan

Diagram ini digambar ulang dengan simbol UML standar (stickman untuk aktor,
elips untuk use case) menggunakan tools seperti draw.io / Lucidchart.
Satu aktor + tujuh use case mencerminkan ruang lingkup sistem yang fokus:
sistem pendukung keputusan untuk pengguna akhir, tanpa modul admin.
