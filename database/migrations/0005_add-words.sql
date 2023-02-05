CREATE TABLE words (
  name          VARCHAR(255)    PRIMARY KEY,
  created_at    TIMESTAMPTZ     NOT NULL                DEFAULT NOW(),
  created_by    UUID            REFERENCES users(id),
  deleted_at    TIMESTAMPTZ,
  deleted_by    UUID            REFERENCES users(id)
);

CREATE TABLE word_meanings (
  id            UUID            PRIMARY KEY             DEFAULT gen_random_uuid(),
  word          VARCHAR(255)    NOT NULL                REFERENCES words(name),
  definition    TEXT            NOT NULL,
  created_at    TIMESTAMPTZ     NOT NULL                DEFAULT NOW(),
  created_by    UUID            REFERENCES users(id),
  deleted_at    TIMESTAMPTZ,
  deleted_by    UUID            REFERENCES users(id)
);

CREATE TABLE labels (
  name          VARCHAR(255)    PRIMARY KEY,
  created_at    TIMESTAMPTZ     NOT NULL                DEFAULT NOW(),
  created_by    UUID            REFERENCES users(id),
  deleted_at    TIMESTAMPTZ,
  deleted_by    UUID            REFERENCES users(id)
);

CREATE TABLE word_labels (
  id            UUID            PRIMARY KEY             DEFAULT gen_random_uuid(),
  word          VARCHAR(255)    NOT NULL                REFERENCES words(name),
  label         VARCHAR(255)    NOT NULL                REFERENCES labels(name),
  created_at    TIMESTAMPTZ     NOT NULL                DEFAULT NOW(),
  created_by    UUID            REFERENCES users(id),
  deleted_at    TIMESTAMPTZ,
  deleted_by    UUID            REFERENCES users(id)
);

CREATE UNIQUE INDEX ON word_labels(word, label) WHERE deleted_at IS NULL;
