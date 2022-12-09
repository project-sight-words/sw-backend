import { Injectable, Param } from "@nestjs/common";
import { DatabaseService } from "database/database.service";
import { UpdateClassDto } from "./dto/classes.dto";
import { plainToInstance } from "class-transformer";
import { Class, ClassStudent, ClassTeacher } from "entities/class.entity";
import { Teacher } from "entities/teacher.entities";

@Injectable()
export class ClassesRepository {
  constructor(private databaseService: DatabaseService) {}

  async createClass(createClassDto: UpdateClassDto): Promise<Class> {
    const rows = await this.databaseService.query(
      "INSERT INTO classes (day, time) VALUES ($1, $2) RETURNING *",
      [createClassDto.day, createClassDto.time],
    );

    return plainToInstance(Class, rows[0]);
  }

  async findAll(): Promise<Class[]> {
    const rows = await this.databaseService.query("SELECT * FROM classes");
    return plainToInstance(Class, rows);
  }

  async findOne(id: string): Promise<Class> {
    const rows = await this.databaseService.query(
      "SELECT * FROM classes WHERE id = $1",
      [id],
    );

    this.databaseService.checkIfResultNotEmpty(rows);
    return plainToInstance(Class, rows[0]);
  }

  async updateClass(
    id: string,
    updateClassDto: UpdateClassDto,
  ): Promise<Class> {
    const rows = await this.databaseService.query(
      "UPDATE classes SET day = $1, time = $2 WHERE id = $3 RETURNING *",
      [updateClassDto.day, updateClassDto.time, id],
    );

    this.databaseService.checkIfResultNotEmpty(rows);
    return plainToInstance(Class, rows[0]);
  }

  async remove(@Param("id") id: string): Promise<Class> {
    const rows = await this.databaseService.query(
      "DELETE FROM classes WHERE id = $1 returning *",
      [id],
    );

    this.databaseService.checkIfResultNotEmpty(rows);
    return plainToInstance(Class, rows[0]);
  }

  async addTeacherToClass(
    classId: string,
    teacherId: string,
    isFormTeacher: boolean,
  ) {
    const rows = await this.databaseService.query(
      "INSERT INTO class_teachers (class_id, teacher_id, is_form_teacher, created_by, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *",
      [classId, teacherId, isFormTeacher, null],
    );
    return plainToInstance(ClassTeacher, rows[0]);
  }

  async getTeachersFromClass(classId: string) {
    const rows = await this.databaseService.query(
      `
      SELECT 
        * 
      FROM 
        class_teachers 
        INNER JOIN teachers ON class_teachers.teacher_id = teachers.id 
      WHERE 
        class_id = $1 
        AND class_teachers.deleted_at IS NULL
      `,
      [classId],
    );

    return plainToInstance(Teacher, rows);
  }

  async removeTeacherFromClass(classId: string, teacherId: string) {
    const rows = await this.databaseService.query(
      `
      UPDATE 
        class_teachers 
      SET 
        deleted_at = NOW(), 
        deleted_by = $3 
      WHERE 
        class_id = $1 
        AND teacher_id = $2 RETURNING *`,
      [classId, teacherId, null],
    );

    this.databaseService.checkIfResultNotEmpty(rows);
    return plainToInstance(ClassTeacher, rows[0]);
  }

  async addStudentToClass(classId: string, studentId: string) {
    const rows = await this.databaseService.query(
      "INSERT INTO class_students (class_id, student_id, created_by, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *",
      [classId, studentId, null],
    );

    return plainToInstance(ClassStudent, rows[0]);
  }

  async getStudentsFromClass(classId: string) {
    const rows = await this.databaseService.query(
      `
      SELECT 
        * 
      FROM 
        class_students 
        INNER JOIN students ON class_students.student_id = students.id 
      WHERE 
        class_id = $1 
        AND class_students.deleted_at IS NULL
      `,
      [classId],
    );

    return plainToInstance(ClassStudent, rows);
  }

  async removeStudentFromClass(classId: string, studentId: string) {
    const rows = await this.databaseService.query(
      `
      UPDATE 
        class_students 
      SET 
        deleted_at = NOW(), 
        deleted_by = $3 
      WHERE 
        class_id = $1 
        AND student_id = $2 RETURNING *
      `,
      [classId, studentId, null],
    );

    this.databaseService.checkIfResultNotEmpty(rows);
    return plainToInstance(ClassStudent, rows[0]);
  }
}
