CREATE TABLE IF NOT EXISTS kategori (
  id SERIAL PRIMARY KEY,
  nama VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS pekerjaan (
  id VARCHAR(50) PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  kategori_id INTEGER NOT NULL REFERENCES kategori(id),
  gaji_min DECIMAL(5,1) NOT NULL CHECK (gaji_min >= 0),
  gaji_max DECIMAL(5,1) NOT NULL CHECK (gaji_max >= gaji_min),
  demand SMALLINT NOT NULL CHECK (demand BETWEEN 1 AND 5)
);
CREATE INDEX IF NOT EXISTS idx_pekerjaan_kategori ON pekerjaan(kategori_id);

CREATE TABLE IF NOT EXISTS skill (
  id SERIAL PRIMARY KEY,
  nama VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS pekerjaan_skill (
  pekerjaan_id VARCHAR(50) NOT NULL REFERENCES pekerjaan(id) ON DELETE CASCADE,
  skill_id INTEGER NOT NULL REFERENCES skill(id) ON DELETE CASCADE,
  PRIMARY KEY (pekerjaan_id, skill_id)
);

CREATE TABLE IF NOT EXISTS roadmap (
  id SERIAL PRIMARY KEY,
  pekerjaan_id VARCHAR(50) NOT NULL REFERENCES pekerjaan(id) ON DELETE CASCADE,
  urutan SMALLINT NOT NULL,
  judul VARCHAR(100) NOT NULL,
  detail TEXT NOT NULL,
  estimasi VARCHAR(30) NOT NULL,
  UNIQUE (pekerjaan_id, urutan)
);
CREATE INDEX IF NOT EXISTS idx_roadmap_pekerjaan ON roadmap(pekerjaan_id);

-- ---------------------------------------------------------------------------
-- Akun dan data per akun (sebelumnya users.json + sesi memori).
-- Seluruh data persisten aplikasi kini tinggal di PostgreSQL.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  email VARCHAR(200) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  dibuat TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sesi (
  token_hash CHAR(64) PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exp TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sesi_user ON sesi(user_id);

CREATE TABLE IF NOT EXISTS profil_skill (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill VARCHAR(40) NOT NULL,
  urutan SMALLINT NOT NULL,
  PRIMARY KEY (user_id, skill)
);

CREATE TABLE IF NOT EXISTS quest_progress (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  karier_id VARCHAR(50) NOT NULL REFERENCES pekerjaan(id) ON DELETE CASCADE,
  langkah SMALLINT NOT NULL,
  PRIMARY KEY (user_id, karier_id, langkah)
);

CREATE TABLE IF NOT EXISTS riwayat (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  waktu TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_riwayat_user ON riwayat(user_id);

-- Satu baris riwayat = satu hasil rekomendasi; skill/minat/hasil
-- disimpan di tabel anak (satu baris per nilai) agar 3NF murni.
CREATE TABLE IF NOT EXISTS riwayat_skill (
  riwayat_id INTEGER NOT NULL REFERENCES riwayat(id) ON DELETE CASCADE,
  urutan SMALLINT NOT NULL,
  skill VARCHAR(100) NOT NULL,
  PRIMARY KEY (riwayat_id, urutan)
);

CREATE TABLE IF NOT EXISTS riwayat_minat (
  riwayat_id INTEGER NOT NULL REFERENCES riwayat(id) ON DELETE CASCADE,
  urutan SMALLINT NOT NULL,
  kategori VARCHAR(50) NOT NULL,
  PRIMARY KEY (riwayat_id, urutan)
);

CREATE TABLE IF NOT EXISTS riwayat_hasil (
  riwayat_id INTEGER NOT NULL REFERENCES riwayat(id) ON DELETE CASCADE,
  urutan SMALLINT NOT NULL,
  karier_id VARCHAR(50) NOT NULL REFERENCES pekerjaan(id) ON DELETE CASCADE,
  skor_akhir DOUBLE PRECISION NOT NULL,
  PRIMARY KEY (riwayat_id, urutan)
);

-- Bobot SAW (sebelumnya data/bobot.json). Total keempat nilai harus = 1.
CREATE TABLE IF NOT EXISTS bobot_saw (
  kriteria VARCHAR(20) PRIMARY KEY,
  nilai DECIMAL(4,3) NOT NULL CHECK (nilai >= 0 AND nilai <= 1)
);

-- Lowongan Glints (sebelumnya data/glints_jobs.csv). Diimpor lewat
-- backend/data/load_glints.py; karier_id NULL = tidak terpetakan.
CREATE TABLE IF NOT EXISTS lowongan_glints (
  id SERIAL PRIMARY KEY,
  karier_id VARCHAR(50) REFERENCES pekerjaan(id) ON DELETE SET NULL,
  judul VARCHAR(300) NOT NULL,
  perusahaan VARCHAR(200) NOT NULL,
  lokasi VARCHAR(200) NOT NULL DEFAULT '',
  gaji_teks VARCHAR(200) NOT NULL DEFAULT '',
  gaji_min DECIMAL(6,1),
  gaji_max DECIMAL(6,1),
  tipe VARCHAR(50) NOT NULL DEFAULT '',
  pengalaman VARCHAR(100) NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_lowongan_karier ON lowongan_glints(karier_id);
