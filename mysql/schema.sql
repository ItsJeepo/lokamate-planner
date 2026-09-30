-- Tripmate.ai — skema MySQL untuk menjalankan Tripmate secara lokal.
-- Jalankan file ini sekali di MySQL-mu (lihat HOSTING.md), misalnya:
--   mysql -u root -p < mysql/schema.sql

CREATE DATABASE IF NOT EXISTS tripmate
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE tripmate;

CREATE TABLE IF NOT EXISTS users (
  id          CHAR(36)      NOT NULL PRIMARY KEY,
  email       VARCHAR(255)  NOT NULL UNIQUE,
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

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
