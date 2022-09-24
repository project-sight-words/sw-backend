CREATE TABLE teachers (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id        TEXT        NOT NULL    UNIQUE(LOWER(staff_id)),
  name            TEXT        NOT NULL,
  updated_at      TIMESTAMPTZ,
  updated_by      UUID
);

CREATE TABLE user_teacher (
  user_id         UUID        NOT NULL,
  teacher_id      UUID        NOT NULL,
  id              UUID        PRIMARY KEY(user_id, teacher_id),
  created_at      TIMESTAMPTZ,
  created_by      UUID,
  deleted_at      TIMESTAMPTZ,
  deleted_by      UUID,
  CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(id),
  CONSTRAINT fk_teacher FOREIGN KEY(teacher_id) REFERENCES teachers(id),
  UNIQUE(user_id, teacher_id, deleted_at=NULL)
