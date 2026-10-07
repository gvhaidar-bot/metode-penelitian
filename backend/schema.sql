-- Skema database MySQL: Sistem Rekomendasi Karier IT
-- Buat database:  CREATE DATABASE karier_it CHARACTER SET utf8mb4;

CREATE TABLE IF NOT EXISTS pekerjaan (
  id VARCHAR(50) PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  kategori VARCHAR(50) NOT NULL,
  gaji_min DECIMAL(5,1) NOT NULL COMMENT 'juta IDR per bulan',
  gaji_max DECIMAL(5,1) NOT NULL COMMENT 'juta IDR per bulan',
  demand TINYINT NOT NULL COMMENT '1-5 kebutuhan pasar'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS pekerjaan_skill (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pekerjaan_id VARCHAR(50) NOT NULL,
  skill VARCHAR(100) NOT NULL,
  FOREIGN KEY (pekerjaan_id) REFERENCES pekerjaan(id) ON DELETE CASCADE,
  INDEX idx_pekerjaan (pekerjaan_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS roadmap (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pekerjaan_id VARCHAR(50) NOT NULL,
  urutan TINYINT NOT NULL,
  langkah TEXT NOT NULL,
  FOREIGN KEY (pekerjaan_id) REFERENCES pekerjaan(id) ON DELETE CASCADE,
  INDEX idx_pekerjaan (pekerjaan_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
