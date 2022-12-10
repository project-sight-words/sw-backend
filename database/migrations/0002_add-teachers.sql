CREATE TABLE teachers (
  id              UUID          PRIMARY KEY             DEFAULT gen_random_uuid(),
  staff_id        TEXT          NOT NULL,
  name            TEXT          NOT NULL,
  updated_at      TIMESTAMPTZ   NOT NULL                DEFAULT NOW(),
  updated_by      UUID          REFERENCES users(id)
);

CREATE TABLE teacher_users (
  user_id         UUID          NOT NULL UNIQUE,
  teacher_id      UUID          NOT NULL UNIQUE,
  created_at      TIMESTAMPTZ   NOT NULL                DEFAULT NOW(),
  created_by      UUID          REFERENCES users(id),
  deleted_at      TIMESTAMPTZ,
  deleted_by      UUID          REFERENCES users(id),
  PRIMARY KEY (user_id, teacher_id),
  CONSTRAINT fk_users FOREIGN KEY (user_id) REFERENCES users (id),
  CONSTRAINT fk_teachers FOREIGN KEY (teacher_id) REFERENCES teachers (id),
  CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES users (id)
);

CREATE UNIQUE INDEX staff_id_upper_unique ON teachers (UPPER(staff_id));
CREATE UNIQUE INDEX ON user_id WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX ON teacher_id WHERE deleted_at IS NULL;
