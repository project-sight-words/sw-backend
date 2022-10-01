-- TODO: Constrain updated_by to only refer to users UUID
-- TODO: Error if someone attempts to delete from the users
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  updated_at TIMESTAMPTZ,
  updated_by UUID
);
-- Don't need to explicitly enforce UNIQUE(user_id, student_id) since the
-- PRIAMRY KEY constraint already enforces this
-- TODO: Constrain created_by to teacher/admin
-- TODO: Error if someone attempts to delete from the students
CREATE TABLE user_students (
  user_id UUID NOT NULL,
  student_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  PRIMARY KEY (user_id, student_id),
  CONSTRAINT fk_users FOREIGN KEY (user_id) REFERENCES users (id),
  CONSTRAINT fk_students FOREIGN KEY (student_id) REFERENCES students (id)
);