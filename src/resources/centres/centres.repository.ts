import { Injectable } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { DatabaseService } from "database/database.service";
import { Centre, ClassToCentre } from "entities/centre.entity";

@Injectable()
export class CentresRepository {
  constructor(private databaseService: DatabaseService) {}

  async findAll() {
    const rows = await this.databaseService.query("SELECT * FROM centres;");
    return plainToInstance(Centre, rows);
  }

  async findOne(id: string) {
    const rows = await this.databaseService.query(
      "SELECT * FROM centres WHERE id = $1;",
      [id],
    );

    this.databaseService.checkIfResultNotEmpty(rows);
    return plainToInstance(Centre, rows[0]);
  }

  async addClassToCentre(centreId: string, classId: string) {
    const rows = await this.databaseService.query(
      "INSERT INTO class_to_centre (centre_id, class_id, created_by, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *;",
      [centreId, classId, null],
    );

    return plainToInstance(ClassToCentre, rows[0]);
  }

  async getClassesFromCentre(centreId: string) {
    const rows = await this.databaseService.query(
      `
      SELECT 
        * 
      FROM 
        class_to_centre 
      INNER JOIN classes ON classes.id = class_to_centre.class_id 
      WHERE 
        centre_id = $1 
        AND class_to_centre.deleted_at IS NULL;
      `,
      [centreId],
    );

    return plainToInstance(ClassToCentre, rows);
  }

  async removeClassFromCentre(centreId: string, classId: string) {
    const rows = await this.databaseService.query(
      "UPDATE class_to_centre SET deleted_at = NOW() WHERE centre_id = $1 AND class_id = $2 RETURNING *;",
      [centreId, classId],
    );

    this.databaseService.checkIfResultNotEmpty(rows);
    return plainToInstance(ClassToCentre, rows[0]);
  }
}
