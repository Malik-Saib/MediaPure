-- MediaPure: PostgreSQL schema.
-- The API also creates these tables automatically on first start (SQLAlchemy create_all);
-- run this file only if you prefer to provision the schema yourself.
--
--   sudo -u postgres psql -c "CREATE USER aimr WITH PASSWORD 'CHANGE_ME_DB_PASSWORD';"
--   sudo -u postgres psql -c "CREATE DATABASE aimr OWNER aimr;"
--   psql "postgresql://aimr:CHANGE_ME_DB_PASSWORD@127.0.0.1:5432/aimr" -f schema.sql

-- Anonymous processing statistics. No media, file names or metadata values are stored.
CREATE TABLE IF NOT EXISTS processing_jobs (
    id              SERIAL PRIMARY KEY,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    visitor_hash    VARCHAR(64)  NOT NULL,          -- salted, rotates daily; not reversible to an IP
    media           VARCHAR(8)   NOT NULL DEFAULT 'image',   -- image | video
    kind            VARCHAR(16)  NOT NULL DEFAULT 'clean',
    status          VARCHAR(16)  NOT NULL DEFAULT 'success',
    file_format     VARCHAR(8)   NOT NULL DEFAULT '',
    original_size   INTEGER      NOT NULL DEFAULT 0,
    cleaned_size    INTEGER      NOT NULL DEFAULT 0,
    fields_found    INTEGER      NOT NULL DEFAULT 0,
    fields_removed  INTEGER      NOT NULL DEFAULT 0,
    privacy_before  INTEGER      NOT NULL DEFAULT 0,
    privacy_after   INTEGER      NOT NULL DEFAULT 0,
    had_location    BOOLEAN      NOT NULL DEFAULT FALSE,
    had_ai_data     BOOLEAN      NOT NULL DEFAULT FALSE,
    duration_ms     INTEGER      NOT NULL DEFAULT 0,
    error           VARCHAR(200) NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS ix_processing_jobs_created_at   ON processing_jobs (created_at);
CREATE INDEX IF NOT EXISTS ix_processing_jobs_visitor_hash ON processing_jobs (visitor_hash);
CREATE INDEX IF NOT EXISTS ix_processing_jobs_status       ON processing_jobs (status);
CREATE INDEX IF NOT EXISTS ix_processing_jobs_media        ON processing_jobs (media);

-- Upgrading a database created before the video cleaner existed? The API adds this
-- column automatically on start, or you can run it yourself:
-- ALTER TABLE processing_jobs ADD COLUMN IF NOT EXISTS media VARCHAR(8) NOT NULL DEFAULT 'image';

CREATE TABLE IF NOT EXISTS contact_messages (
    id            SERIAL PRIMARY KEY,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    name          VARCHAR(120) NOT NULL,
    email         VARCHAR(200) NOT NULL,
    topic         VARCHAR(60)  NOT NULL DEFAULT 'General',
    message       TEXT         NOT NULL,
    visitor_hash  VARCHAR(64)  NOT NULL DEFAULT '',
    is_read       BOOLEAN      NOT NULL DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS ix_contact_messages_created_at ON contact_messages (created_at);

-- Optional retention: keep 13 months of anonymous statistics.
-- DELETE FROM processing_jobs WHERE created_at < now() - interval '13 months';
