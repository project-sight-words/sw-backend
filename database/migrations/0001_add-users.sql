CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE users (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email           CITEXT      NOT NULL    UNIQUE,
  last_logged_in  TIMESTAMPTZ
);
