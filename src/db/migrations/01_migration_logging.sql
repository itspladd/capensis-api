DROP TABLE IF EXISTS migration_log;

CREATE TABLE migration_log (
  id SERIAL PRIMARY KEY NOT NULL,
  migration_date TIMESTAMPTZ DEFAULT NOW(),
  migration_filename VARCHAR
);