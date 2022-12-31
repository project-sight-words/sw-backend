import { Centre, CentreEntity } from "entities/centre.entity";
import { DatabaseService } from "database/database.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CentresRepository {
  constructor(private databaseService: DatabaseService) {}

  async get(): Promise<CentreEntity[]> {
    const rows = await this.databaseService.query(
      `
        SELECT * FROM centres;
      `,
    );
    const centres = rows.map((r) => CentreEntity.fromObject(r));
    return centres;
  }

  async getById(id: string): Promise<CentreEntity[]> {
    const rows = await this.databaseService.query(
      `
        SELECT * FROM centres 
        WHERE id = $1;
      `,
      [id],
    );
    const centres = rows.map((r) => CentreEntity.fromObject(r));
    return centres;
  }

  async insert(
    data: Centre,
    updatedBy: string | null = null,
  ): Promise<CentreEntity> {
    const { name } = data;
    const rows = await this.databaseService.query(
      `
        INSERT INTO centres (name, updated_at, updated_by)
        VALUES ($1, NOW(), $2)
        RETURNING *; 
      `,
      [name, updatedBy],
    );
    const centre = CentreEntity.fromObject(rows[0]);
    return centre;
  }

  async updateById(
    id: string,
    data: Centre,
    updatedBy: string | null = null,
  ): Promise<CentreEntity> {
    const { name } = data;
    const rows = await this.databaseService.query(
      `
        UPDATE centres
          SET name = $2, 
          updated_at = NOW(), 
          updated_by = $3
        WHERE id = $1
        RETURNING *;
      `,
      [id, name, updatedBy],
    );
    const centre = CentreEntity.fromObject(rows[0]);
    return centre;
  }

  // TODO: async addClassToCentre(centreId: string, classId: string) {
  //   const rows = await this.databaseService.query(
  //     "INSERT INTO centre_classes (centre_id, class_id, created_by, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *;",
  //     [centreId, classId, null],
  //   );

  //   return plainToInstance(CentreClass, rows[0]);
  // }

  // async getClassesFromCentre(centreId: string) {
  //   const rows = await this.databaseService.query(
  //     `
  //     SELECT
  //       *
  //     FROM
  //       centre_classes
  //     INNER JOIN classes ON classes.id = centre_classes.class_id
  //     WHERE
  //       centre_id = $1
  //       AND centre_classes.deleted_at IS NULL;
  //     `,
  //     [centreId],
  //   );

  //   return plainToInstance(CentreClass, rows);
  // }

  // async removeClassFromCentre(centreId: string, classId: string) {
  //   const rows = await this.databaseService.query(
  //     "UPDATE centre_classes SET deleted_at = NOW() WHERE centre_id = $1 AND class_id = $2 RETURNING *;",
  //     [centreId, classId],
  //   );

  //   this.databaseService.checkIfResultNotEmpty(rows);
  //   return plainToInstance(CentreClass, rows[0]);
  // }
}
