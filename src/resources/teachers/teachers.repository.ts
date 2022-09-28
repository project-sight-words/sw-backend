import { InternalServerErrorException, Logger } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import { TeacherEntity } from "src/entities/teacher.entities";
import { TeacherDatabaseObj } from "src/entities/teacher.entities";

export class TeachersRepository {
  constructor(private readonly databaseService: DatabaseService) {}
  private readonly loggerService = new Logger("Database Service");

  async insertTeacher(teachers: TeacherEntity): Promise<TeacherEntity> {
    const query = `
    INSERT INTO teachers(staff_id, name)
    VALUES($1, $2)
    RETURNING *
    `;
    try {
      const request = await this.databaseService.query(query, [
        teachers.get_staff_id(),
        teachers.get_name(),
      ]);

      const response = request[0] as TeacherDatabaseObj;
      return TeacherEntity.loadTeacher(response);
    } catch (error) {
      if (error instanceof Error) {
        this.loggerService.error(error);
      }
      throw new InternalServerErrorException();
    }
  }

  async getTeacher(id: number): Promise<TeacherEntity> {
    const query = `
    SELECT id
    FROM teachers
    WHERE (id = $1)
    `;
    try {
      const request = await this.databaseService.query(query, [id]);
      const response = request[0] as TeacherDatabaseObj;
      return TeacherEntity.loadTeacher(response);
    } catch (error) {
      if (error instanceof Error) {
        this.loggerService.error(error);
      }
      throw new InternalServerErrorException();
    }
  }
}
