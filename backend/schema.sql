-- Skema database PostgreSQL: Sistem Rekomendasi Karier IT
-- Buat database:  CREATE DATABASE karier_it;

CREATE TABLE IF NOT EXISTS pekerjaan (
  id VARCHAR(50) PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  kategori VARCHAR(50) NOT NULL,
  gaji_min DECIMAL(5,1) NOT NULL,  -- juta IDR per bulan
  gaji_max DECIMAL(5,1) NOT NULL,  -- juta IDR per bulan
  demand SMALLINT NOT NULL CHECK (demand BETWEEN 1 AND 5)  -- kebutuhan pasar
);

CREATE TABLE IF NOT EXISTS pekerjaan_skill (
  id SERIAL PRIMARY KEY,
  pekerjaan_id VARCHAR(50) NOT NULL REFERENCES pekerjaan(id) ON DELETE CASCADE,
  skill VARCHAR(100) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_skill_pekerjaan ON pekerjaan_skill(pekerjaan_id);

CREATE TABLE IF NOT EXISTS roadmap (
  id SERIAL PRIMARY KEY,
  pekerjaan_id VARCHAR(50) NOT NULL REFERENCES pekerjaan(id) ON DELETE CASCADE,
  urutan SMALLINT NOT NULL,
  langkah TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_roadmap_pekerjaan ON roadmap(pekerjaan_id);
