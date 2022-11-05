CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE classes (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  day_time      TIMESTAMPTZ  NOT NULL
);

CREATE TABLE student_to_class (
  class_id        UUID        NOT NULL,
  student_id      UUID        NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL,
  created_by      UUID,
  deleted_at      TIMESTAMPTZ,
  deleted_by      UUID,
  PRIMARY KEY (class_id, student_id),
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE teacher_to_class (
  class_id        UUID           NOT NULL,
  teacher_id      UUID           NOT NULL,
  is_form_teacher BOOLEAN        NOT NULL DEFAULT FALSE, 
  created_at      TIMESTAMPTZ    NOT NULL,
  created_by      UUID,
  deleted_at      TIMESTAMPTZ,
  deleted_by      UUID,
  PRIMARY KEY (class_id, teacher_id),
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
);

CREATE TABLE centres (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       CITEXT      NOT NULL
);

CREATE TABLE class_to_centre (
  centre_id       UUID          NOT NULL,
  class_id        UUID          NOT NULL,
  created_at      TIMESTAMPTZ   NOT NULL,
  created_by      UUID,
  deleted_at      TIMESTAMPTZ,
  deleted_by      UUID,
  PRIMARY KEY (centre_id, class_id),
  FOREIGN KEY (centre_id) REFERENCES centres(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);
