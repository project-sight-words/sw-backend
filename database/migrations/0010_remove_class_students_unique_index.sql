DROP INDEX IF EXISTS class_students_student_id_idx;

CREATE UNIQUE INDEX class_students_student_id_class_id_idx ON class_students (student_id, class_id) 
  WHERE deleted_at IS NULL;
