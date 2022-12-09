CREATE TABLE classes (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  day           INTEGER      NOT NULL,
  time          TIME         NOT NULL,
  updated_at    TIMESTAMPTZ,
  updated_by    UUID         REFERENCES users(id),
  CHECK (day >= 1 AND day <= 7)
);

CREATE TABLE class_students (
  class_id        UUID            NOT NULL,
  student_id      UUID            NOT NULL,
  created_at      TIMESTAMPTZ     NOT NULL   DEFAULT NOW(),
  created_by      UUID            REFERENCES users(id),
  deleted_at      TIMESTAMPTZ,
  deleted_by      UUID            REFERENCES users(id),
  PRIMARY KEY (class_id, student_id),
  FOREIGN KEY (class_id)          REFERENCES classes(id),
  FOREIGN KEY (student_id)        REFERENCES students(id)
);

CREATE TABLE class_teachers (
  class_id        UUID            NOT NULL,
  teacher_id      UUID            NOT NULL,
  is_form_teacher BOOLEAN         NOT NULL   DEFAULT FALSE, 
  created_at      TIMESTAMPTZ     NOT NULL   DEFAULT NOW(),
  created_by      UUID            REFERENCES users(id),
  deleted_at      TIMESTAMPTZ,
  deleted_by      UUID            REFERENCES users(id),
  PRIMARY KEY (class_id, teacher_id),
  FOREIGN KEY (class_id)          REFERENCES classes(id),
  FOREIGN KEY (teacher_id)        REFERENCES teachers(id)
);

CREATE TABLE centres (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       CITEXT      NOT NULL,
  updated_at    TIMESTAMPTZ,
  updated_by    UUID         REFERENCES users(id)
);

CREATE TABLE class_centres (
  centre_id       UUID            NOT NULL,
  class_id        UUID            NOT NULL,
  created_at      TIMESTAMPTZ     NOT NULL   DEFAULT NOW(),
  created_by      UUID            REFERENCES users(id),
  deleted_at      TIMESTAMPTZ,
  deleted_by      UUID            REFERENCES users(id),
  PRIMARY KEY (centre_id, class_id),
  FOREIGN KEY (centre_id)         REFERENCES centres(id),
  FOREIGN KEY (class_id)          REFERENCES classes(id)
);
