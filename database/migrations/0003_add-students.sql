CREATE TABLE students (
  id          UUID          PRIMARY KEY             DEFAULT gen_random_uuid(),
  student_id  TEXT          NOT NULL,
  name        TEXT          NOT NULL,
  updated_at  TIMESTAMPTZ   NOT NULL                DEFAULT NOW(),
  updated_by  UUID          REFERENCES users (id)
);

CREATE UNIQUE INDEX student_id_upper_unique ON students (UPPER(student_id));

CREATE TABLE student_users (
  id          UUID          PRIMARY KEY             DEFAULT gen_random_uuid(),
  user_id     UUID          NOT NULL  UNIQUE          REFERENCES users (id),
  student_id  UUID          NOT NULL  UNIQUE          REFERENCES students (id),
  created_at  TIMESTAMPTZ   NOT NULL  DEFAULT NOW(),
  created_by  UUID                                    REFERENCES users (id),
  deleted_at  TIMESTAMPTZ,
  deleted_by  UUID                                    REFERENCES users(id)
);

CREATE UNIQUE INDEX ON student_users(user_id) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX ON student_users(student_id) WHERE deleted_at IS NULL;
