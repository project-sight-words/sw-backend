import { InternalServerErrorException } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";

export class TeachersRepository {
  async insertTeacher(staff_id: string, name: string): Promise<void> {
    const rows = await DatabaseService.query(
      `
      INSERT INTO teachers(staff_id, name)
      VALUES (staff_id, name)
      RETURNING *;
      `,
    );
    if (rows instanceof Error) throw new InternalServerErrorException();
    if (rows.length !== 1) throw new InternalServerErrorException();
  }
}
