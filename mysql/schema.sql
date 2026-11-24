-- Lokamate — skema MySQL untuk menjalankan Lokamate secara lokal (tanpa Lovable Cloud).
-- Jalankan sekali:  mysql -u root -p < mysql/schema.sql

CREATE DATABASE IF NOT EXISTS tripmate
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE tripmate;

CREATE TABLE IF NOT EXISTS users (
  id             CHAR(36)      NOT NULL PRIMARY KEY,
  email          VARCHAR(255)  NOT NULL UNIQUE,
  password_hash  VARCHAR(255)  NULL,
  full_name      VARCHAR(100)  NULL,
  role           VARCHAR(20)   NOT NULL DEFAULT 'user',
  created_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Jika tabel users lama sudah ada, tambahkan kolom login (abaikan error "Duplicate column").
-- ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) NULL, ADD COLUMN full_name VARCHAR(100) NULL, ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'user';

CREATE TABLE IF NOT EXISTS itineraries (
  id          CHAR(36)      NOT NULL PRIMARY KEY,
  user_id     CHAR(36)      NOT NULL,
  city        VARCHAR(120)  NOT NULL,
  style       VARCHAR(60)   NOT NULL,
  budget      BIGINT        NOT NULL,
  days        INT           NOT NULL,
  notes       TEXT          NULL,
  result      JSON          NOT NULL,
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_itineraries_user (user_id, created_at),
  CONSTRAINT fk_itineraries_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Akun admin tester: admin@lokamate.local (atau username "admin")
INSERT INTO users (id, email, password_hash, full_name, role) VALUES
  ('00000000-0000-4000-8000-000000000001', 'admin@lokamate.local',
   'pbkdf2$100000$4dVeJvRjbaocTaV1nDJViA==$2tVbG1gkHdtFnmC7h6rsxAvwYHWNBZopfK1elLwolhg=',
   'Admin Tester', 'admin')
ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = 'admin';
