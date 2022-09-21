CREATE TABLE teachers (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id        TEXT        NOT NULL    UNIQUE(LOWER(staff_id)),
  name            TEXT,
  updated_at      TIMESTAMPTZ,
  updated_by      UUID
);

CREATE TABLE user_teacher (
  id          UUID         PRIMARY KEY(user_id, teacher_id)
  user_id     UUID         REFERENCES users(id),
  teacher_id    UUID       REFERENCES teacher(id),
  created_at  TIMESTAMPTZ,
  created_by  UUID,
  deleted_at  TIMESTAMPTZ,
  deleted_by  UUID    
  UNIQUE(user_id, teacher_id, deleted_at=NULL)
);