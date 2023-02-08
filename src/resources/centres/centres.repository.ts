import { CentreDatum, CentreEntity } from "entities/centre.entity";
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
    const entities = rows.map((r) => CentreEntity.fromObject(r));
    return entities;
  }

  async getById(id: string): Promise<CentreEntity[]> {
    const entities = await this.getByIds(new Set(id));
    return entities;
  }

  async getByIds(ids: Set<string>): Promise<CentreEntity[]> {
    const rows = await this.databaseService.query(
      `
        SELECT * FROM centres 
        WHERE id = ANY($1::UUID[]);
      `,
      [Array.from(ids)],
    );
    const entities = rows.map((r) => CentreEntity.fromObject(r));
    return entities;
  }

  async insert(
    datum: CentreDatum,
    insertedBy: string | null = null,
  ): Promise<CentreEntity> {
    const { name } = datum;
    const rows = await this.databaseService.query(
      `
        INSERT INTO centres (name, updated_at, updated_by)
        VALUES ($1, NOW(), $2)
        RETURNING *; 
      `,
      [name, insertedBy],
    );
    const entity = CentreEntity.fromObject(rows[0]);
    return entity;
  }

  async updateById(
    id: string,
    datum: CentreDatum,
    updatedBy: string | null = null,
  ): Promise<CentreEntity> {
    const { name } = datum;
    const rows = await this.databaseService.query(
      `
        UPDATE centres SET 
          name = $2, 
          updated_at = NOW(), 
          updated_by = $3
        WHERE id = $1
        RETURNING *;
      `,
      [id, name, updatedBy],
    );
    const entity = CentreEntity.fromObject(rows[0]);
    return entity;
  }
}
