CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL,
  name TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID,
  CONSTRAINT fk_users FOREIGN KEY (updated_by) REFERENCES users (id)
);

CREATE TABLE student_users (
  user_id UUID NOT NULL UNIQUE,
  student_id UUID NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  PRIMARY KEY (user_id, student_id),
  CONSTRAINT fk_users FOREIGN KEY (user_id) REFERENCES users (id),
  CONSTRAINT fk_students FOREIGN KEY (student_id) REFERENCES students (id),
  CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES users (id)
);

CREATE UNIQUE INDEX student_id_upper_unique ON students (UPPER(student_id));
