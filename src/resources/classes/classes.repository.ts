import { Injectable, Param } from "@nestjs/common";
import { DatabaseService } from "database/database.service";
import { UpdateClassDto } from "./dto/classes.dto";
import { plainToInstance } from "class-transformer";
import {
  Class,
  StudentToClass,
  TeacherToClass,
} from "../../entities/class.entity";
import { Teacher } from "entities/teacher.entities";

@Injectable()
export class ClassesRepository {
  constructor(private databaseService: DatabaseService) {}

  async createClass(createClassDto: UpdateClassDto): Promise<Class> {
    const rows = await this.databaseService.query(
      "INSERT INTO classes (day_time) VALUES ($1) RETURNING *",
      [createClassDto.dayTime],
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
      "UPDATE classes SET day_time = $1 WHERE id = $2 RETURNING *",
      [updateClassDto.dayTime, id],
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
    class_id: string,
    teacher_id: string,
    is_form_teacher: boolean,
  ) {
    const rows = await this.databaseService.query(
      "INSERT INTO teacher_to_class (class_id, teacher_id, is_form_teacher, created_by, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *",
      [class_id, teacher_id, is_form_teacher, null],
    );
    return plainToInstance(TeacherToClass, rows[0]);
  }

  async getTeachersFromClass(class_id: string) {
    const rows = await this.databaseService.query(
      `
      SELECT 
        * 
      FROM 
        teacher_to_class 
        INNER JOIN teachers ON teacher_to_class.teacher_id = teachers.id 
      WHERE 
        class_id = $1 
        AND teacher_to_class.deleted_at IS NULL
      `,
      [class_id],
    );

    return plainToInstance(Teacher, rows);
  }

  async removeTeacherFromClass(class_id: string, teacher_id: string) {
    const rows = await this.databaseService.query(
      `
      UPDATE 
        teacher_to_class 
      SET 
        deleted_at = NOW(), 
        deleted_by = $3 
      WHERE 
        class_id = $1 
        AND teacher_id = $2 RETURNING *`,
      [class_id, teacher_id, null],
    );

    this.databaseService.checkIfResultNotEmpty(rows);
    return plainToInstance(TeacherToClass, rows[0]);
  }

  async addStudentToClass(class_id: string, student_id: string) {
    const rows = await this.databaseService.query(
      "INSERT INTO student_to_class (class_id, student_id, created_by, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *",
      [class_id, student_id, null],
    );

    return plainToInstance(StudentToClass, rows[0]);
  }

  async getStudentsFromClass(class_id: string) {
    const rows = await this.databaseService.query(
      `
      SELECT 
        * 
      FROM 
        student_to_class 
        INNER JOIN students ON student_to_class.student_id = students.id 
      WHERE 
        class_id = $1 
        AND student_to_class.deleted_at IS NULL
      `,
      [class_id],
    );

    return plainToInstance(StudentToClass, rows);
  }

  async removeStudentFromClass(class_id: string, student_id: string) {
    const rows = await this.databaseService.query(
      `
      UPDATE 
        student_to_class 
      SET 
        deleted_at = NOW(), 
        deleted_by = $3 
      WHERE 
        class_id = $1 
        AND student_id = $2 RETURNING *
      `,
      [class_id, student_id, null],
    );

    this.databaseService.checkIfResultNotEmpty(rows);
    return plainToInstance(StudentToClass, rows[0]);
  }
}
