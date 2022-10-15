CREATE TABLE teachers (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id        CITEXT        NOT NULL UNIQUE,
  name            TEXT        NOT NULL,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by      UUID
);

CREATE TABLE teacher_users (
  user_id         UUID,
  teacher_id      UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by      UUID,
  deleted_at      TIMESTAMPTZ,
  deleted_by      UUID,
  PRIMARY KEY(user_id, teacher_id),
  CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(id),
  CONSTRAINT fk_teacher FOREIGN KEY(teacher_id) REFERENCES teachers(id),
);
