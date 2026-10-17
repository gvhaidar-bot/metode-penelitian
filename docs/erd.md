# Entity Relationship Diagram (ERD) — Basis Data Karier IT

Seluruh data persisten aplikasi tinggal di PostgreSQL (12 tabel):
basis pengetahuan (karier, skill, roadmap, bobot, lowongan) dan data
per akun (akun, sesi, skill profil, quest, riwayat). Backend tidak
membaca file JSON/CSV saat berjalan; file di `backend/data` hanya
bahan seed/dataset (`pekerjaan.json` -> `seed.sql`, `glints_jobs.csv`
-> `load_glints.py`).

```mermaid
erDiagram
    kategori ||--o{ pekerjaan : memiliki
    pekerjaan ||--o{ pekerjaan_skill : membutuhkan
    skill ||--o{ pekerjaan_skill : dipakai_oleh
    pekerjaan ||--o{ roadmap : memiliki
    pekerjaan ||--o{ quest_progress : ditargetkan
    pekerjaan ||--o{ lowongan_glints : dipetakan_ke
    users ||--o{ sesi : memiliki
    users ||--o{ profil_skill : memiliki
    users ||--o{ quest_progress : mengerjakan
    users ||--o{ riwayat : memiliki

    kategori {
        int id PK
        string nama UK
    }
    pekerjaan {
        string id PK
        string nama
        int kategori_id FK
        decimal gaji_min
        decimal gaji_max
        int demand
    }
    skill {
        int id PK
        string nama UK
    }
    pekerjaan_skill {
        string pekerjaan_id PK,FK
        int skill_id PK,FK
    }
    roadmap {
        int id PK
        string pekerjaan_id FK
        int urutan
        string judul
        text detail
        string estimasi
    }
    bobot_saw {
        string kriteria PK
        decimal nilai
    }
    lowongan_glints {
        int id PK
        string karier_id FK
        string judul
        string perusahaan
        string lokasi
        string gaji_teks
        decimal gaji_min
        decimal gaji_max
        string tipe
        string pengalaman
    }
    users {
        int id PK
        string nama
        string email UK
        string password_hash
        datetime dibuat
    }
    sesi {
        string token_hash PK
        int user_id FK
        datetime exp
    }
    profil_skill {
        int user_id PK,FK
        string skill PK
        int urutan
    }
    quest_progress {
        int user_id PK,FK
        string karier_id PK,FK
        int langkah PK
    }
    riwayat {
        int id PK
        int user_id FK
        datetime waktu
        jsonb skills
        jsonb minat
        jsonb hasil
    }
```

## Tabel

### Basis pengetahuan

| Tabel | Kolom kunci | Isi saat ini |
|---|---|---|
| `kategori` | `id`, `nama` (unik) | 5 kategori: Data & AI, Desain & Manajemen, Infrastruktur & Keamanan, Mobile, Web |
| `pekerjaan` | `id`, `nama`, `kategori_id` (FK), `gaji_min`, `gaji_max`, `demand` (1–5) | 23 karier |
| `skill` | `id`, `nama` (unik) | 189 skill |
| `pekerjaan_skill` | `pekerjaan_id` + `skill_id` (PK komposit) | 299 relasi |
| `roadmap` | `id`, `pekerjaan_id` (FK), `urutan`, `judul`, `detail`, `estimasi` | 138 langkah (6 per karier) |
| `bobot_saw` | `kriteria`, `nilai` | 4 bobot: skill 0.45, minat 0.25, gaji 0.15, demand 0.15 (total = 1) |
| `lowongan_glints` | `id`, `karier_id` (FK, boleh NULL bila tidak terpetakan), `judul`, `perusahaan`, `lokasi`, `gaji_teks`, `gaji_min`, `gaji_max`, `tipe`, `pengalaman` | 1.133 lowongan Glints |

### Data per akun

| Tabel | Kolom kunci | Keterangan |
|---|---|---|
| `users` | `id`, `nama`, `email` (unik), `password_hash`, `dibuat` | Password disimpan sebagai hash werkzeug (scrypt), bukan mentah |
| `sesi` | `token_hash` (SHA-256 token), `user_id` (FK), `exp` | Token mentah tidak tersimpan; sesi kadaluarsa 24 jam |
| `profil_skill` | `user_id` (FK) + `skill` (PK komposit), `urutan` | Skill yang disimpan user (bebas, tidak harus ada di tabel `skill`) |
| `quest_progress` | `user_id` + `karier_id` + `langkah` (PK komposit) | Satu baris = satu langkah roadmap yang sudah diselesaikan |
| `riwayat` | `id`, `user_id` (FK), `waktu`, `skills`, `minat`, `hasil` (JSONB) | Riwayat rekomendasi, terbaru dulu, maks 50 per akun |

## Catatan

- `pekerjaan_skill` adalah junction table: satu karier punya banyak
  skill, satu skill dipakai banyak karier (many-to-many).
- `roadmap` menyimpan langkah sebagai `{judul, detail, estimasi}` —
  format yang sama persis dengan `pekerjaan.json`, sehingga backend
  mengembalikan bentuk yang sama dari database.
- `UNIQUE (pekerjaan_id, urutan)` menjamin urutan langkah roadmap tidak
  ganda dalam satu karier.
- Seluruh `INSERT` di `seed.sql` memakai `ON CONFLICT DO NOTHING`,
  sehingga seed aman dijalankan berulang kali.
- Hapus akun (`users`) menghapus sesi, skill profil, quest, dan
  riwayatnya (`ON DELETE CASCADE`); lowongan Glints yang terpetakan ke
  karier yang dihapus menjadi tidak terpetakan (`ON DELETE SET NULL`).
