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
