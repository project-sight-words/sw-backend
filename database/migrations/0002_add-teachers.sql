CREATE TABLE teachers (
  id              UUID          PRIMARY KEY             DEFAULT gen_random_uuid(),
  staff_id        TEXT          NOT NULL,
  name            TEXT          NOT NULL,
  updated_at      TIMESTAMPTZ   NOT NULL                DEFAULT NOW(),
  updated_by      UUID          REFERENCES users(id)
);

CREATE UNIQUE INDEX staff_id_upper_unique ON teachers (UPPER(staff_id));

CREATE TABLE teacher_users (
  id              UUID          PRIMARY KEY             DEFAULT gen_random_uuid(),
  user_id         UUID          NOT NULL                REFERENCES users(id),
  teacher_id      UUID          NOT NULL                REFERENCES teachers (id),
  created_at      TIMESTAMPTZ   NOT NULL                DEFAULT NOW(),
  created_by      UUID          REFERENCES users(id),
  deleted_at      TIMESTAMPTZ,
  deleted_by      UUID          REFERENCES users(id)
);

CREATE UNIQUE INDEX ON teacher_users(user_id) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX ON teacher_users(teacher_id) WHERE deleted_at IS NULL;
