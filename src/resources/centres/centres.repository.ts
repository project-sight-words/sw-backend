import { Centre, CentreClass } from "entities/centre.entity";
import { DatabaseService } from "database/database.service";
import { Injectable } from "@nestjs/common";
import { plainToInstance } from "class-transformer";

@Injectable()
export class CentresRepository {
  constructor(private databaseService: DatabaseService) {}

  async get(): Promise<Centre[]> {
    const rows = await this.databaseService.query("SELECT * FROM centres;");
    const centres = plainToInstance(Centre, rows);
    return centres;
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
      "INSERT INTO centre_classes (centre_id, class_id, created_by, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *;",
      [centreId, classId, null],
    );

    return plainToInstance(CentreClass, rows[0]);
  }

  async getClassesFromCentre(centreId: string) {
    const rows = await this.databaseService.query(
      `
      SELECT 
        * 
      FROM 
        centre_classes 
      INNER JOIN classes ON classes.id = centre_classes.class_id 
      WHERE 
        centre_id = $1 
        AND centre_classes.deleted_at IS NULL;
      `,
      [centreId],
    );

    return plainToInstance(CentreClass, rows);
  }

  async removeClassFromCentre(centreId: string, classId: string) {
    const rows = await this.databaseService.query(
      "UPDATE centre_classes SET deleted_at = NOW() WHERE centre_id = $1 AND class_id = $2 RETURNING *;",
      [centreId, classId],
    );

    this.databaseService.checkIfResultNotEmpty(rows);
    return plainToInstance(CentreClass, rows[0]);
  }
}
