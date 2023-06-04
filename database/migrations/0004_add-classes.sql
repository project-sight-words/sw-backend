CREATE TABLE classes (
  id            UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
  start_day     INTEGER          NOT NULL,
  start_time    TIMETZ           NOT NULL,
  end_day       INTEGER          NOT NULL,
  end_time      TIMETZ           NOT NULL, 
  updated_at    TIMESTAMPTZ,
  updated_by    UUID             REFERENCES users(id)
);



CREATE TABLE class_students (
  id              UUID            PRIMARY KEY   DEFAULT gen_random_uuid(),
  class_id        UUID            NOT NULL      REFERENCES classes(id),
  student_id      UUID            NOT NULL      REFERENCES students(id),
  created_at      TIMESTAMPTZ     NOT NULL      DEFAULT NOW(),
  created_by      UUID            REFERENCES users(id),
  deleted_at      TIMESTAMPTZ,
  deleted_by      UUID            REFERENCES users(id)
);

CREATE UNIQUE INDEX ON class_students(student_id) WHERE deleted_at IS NULL;



CREATE TABLE class_teachers (
  id              UUID            PRIMARY KEY   DEFAULT gen_random_uuid(),
  class_id        UUID            NOT NULL      REFERENCES classes(id),
  teacher_id      UUID            NOT NULL      REFERENCES teachers(id),
  is_form_teacher BOOLEAN         NOT NULL      DEFAULT FALSE, 
  created_at      TIMESTAMPTZ     NOT NULL      DEFAULT NOW(),
  created_by      UUID            REFERENCES users(id),
  deleted_at      TIMESTAMPTZ,
  deleted_by      UUID            REFERENCES users(id)
);

CREATE UNIQUE INDEX ON class_teachers(class_id) WHERE is_form_teacher = TRUE AND deleted_at IS NULL;



CREATE TABLE centres (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT          NOT NULL,
  updated_at    TIMESTAMPTZ,
  updated_by    UUID         REFERENCES users(id)
);



CREATE TABLE class_centres (
  id              UUID            PRIMARY KEY   DEFAULT gen_random_uuid(),
  centre_id       UUID            NOT NULL      REFERENCES centres(id),
  class_id        UUID            NOT NULL      REFERENCES classes(id),
  created_at      TIMESTAMPTZ     NOT NULL      DEFAULT NOW(),
  created_by      UUID            REFERENCES users(id),
  deleted_at      TIMESTAMPTZ,
  deleted_by      UUID            REFERENCES users(id)
);

CREATE UNIQUE INDEX ON class_centres(class_id) WHERE deleted_at IS NULL;
