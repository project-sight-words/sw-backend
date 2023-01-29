import { DatabaseService } from "database/database.service";
import { Identifier } from "entities/common";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import {
  ClassCentreDatum,
  ClassCentreEntity,
  ClassDatum,
  ClassEntity,
  ClassStudentDatum,
  ClassStudentEntity,
  ClassTeacherDatum,
  ClassTeacherEntity,
} from "entities/class.entity";

@Injectable()
export class ClassesRepository {
  constructor(private databaseService: DatabaseService) {}

  async get(): Promise<ClassEntity[]> {
    const rows = await this.databaseService.query(
      `
        SELECT 
          classes.id                as id,
          classes.day_time          as day_time,
          class_centres.centre_id   as centre_id,
          centres.name              as name,
          class_centres.created_at  as created_at,
          class_centres.created_by  as created_by,
          classes.updated_at        as updated_at,
          classes.updated_by        as updated_by,
          class_centres.deleted_at  as deleted_at,
          class_centres.deleted_by  as deleted_by
        FROM classes
        JOIN class_centres 
          ON class_centres.class_id = classes.id AND deleted_at IS NULL
        JOIN centres
          ON centres.id = class_centres.centre_id;
      `,
    );
    const entities = rows.map((r) => ClassEntity.fromObject(r));
    return entities;
  }

  async getById(id: string): Promise<ClassEntity> {
    const entities = await this.searchById(id);
    if (entities.length !== 1) throw new InternalServerErrorException();
    return entities[0];
  }

  async searchById(id: string): Promise<ClassEntity[]> {
    const rows = await this.databaseService.query(
      `
        SELECT 
          classes.id                as id,
          classes.day_time          as day_time,
          class_centres.centre_id   as centre_id,
          centres.name              as name,
          class_centres.created_at  as created_at,
          class_centres.created_by  as created_by,
          classes.updated_at        as updated_at,
          classes.updated_by        as updated_by,
          class_centres.deleted_at  as deleted_at,
          class_centres.deleted_by  as deleted_by
        FROM classes
        JOIN class_centres 
          ON class_centres.class_id = classes.id AND deleted_at IS NULL
        JOIN centres
          ON centres.id = class_centres.centre_id
        WHERE classes.id = $1;
      `,
      [id],
    );
    const entities = rows.map((r) => ClassEntity.fromObject(r));
    return entities;
  }

  async getByCentreIds(ids: Set<string>): Promise<ClassEntity[]> {
    const rows = await this.databaseService.query(
      `
        SELECT 
          classes.id                as id,
          classes.day_time          as day_time,
          class_centres.centre_id   as centre_id,
          centres.name              as name,
          class_centres.created_at  as created_at,
          class_centres.created_by  as created_by,
          classes.updated_at        as updated_at,
          classes.updated_by        as updated_by,
          class_centres.deleted_at  as deleted_at,
          class_centres.deleted_by  as deleted_by
        FROM classes
        JOIN class_centres 
          ON class_centres.class_id = classes.id AND deleted_at IS NULL
        JOIN centres
          ON centres.id = class_centres.centre_id
        WHERE class_centres.centre_id = ANY($1::UUID[]);
      `,
      [ids],
    );
    const entities = rows.map((r) => ClassEntity.fromObject(r));
    return entities;
  }

  async getClassCentreByClassId(classId: string): Promise<ClassCentreEntity> {
    const rows = await this.databaseService.query(
      `
        SELECT *
        FROM class_centres
        WHERE deleted_at IS NULL AND class_id = $1;
      `,
      [classId],
    );
    const entities = rows.map((r) => ClassCentreEntity.fromObject(r));
    return entities[0];
  }

  async insert(
    data: ClassDatum,
    insertedBy: string | null = null,
  ): Promise<ClassEntity> {
    const { centreId, dayTime } = data;
    const classRows = await this.databaseService.query(
      `
        INSERT INTO classes (day_time, updated_at, updated_by) 
        VALUES ($2, NOW(), $1) 
        RETURNING *;
      `,
      [insertedBy, dayTime],
    );
    const classIdentifier = Identifier.fromObject(classRows[0]);
    const { id: class_id } = classIdentifier;
    const rows = await this.databaseService.query(
      `
        WITH class_centres AS (
          INSERT INTO class_centres (centre_id, class_id, created_at, created_by) 
          VALUES ($3, $2, NOW(), $1)
          RETURNING *
        )

        SELECT 
          classes.id                AS id,
          classes.day_time          AS day_time,
          class_centres.centre_id   AS centre_id,
          class_centres.created_at  AS created_at,
          class_centres.created_by  AS created_by,
          classes.updated_at        AS updated_at,
          classes.updated_by        AS updated_by,
          class_centres.deleted_at  AS deleted_at,
          class_centres.deleted_by  AS deleted_by
        FROM classes
        JOIN class_centres
          ON  class_centres.class_id = classes.id 
          AND deleted_at IS NULL
        WHERE classes.id = $2;
      `,
      [insertedBy, class_id, centreId],
    );
    const classEntity = ClassEntity.fromObject(rows[0]);
    return classEntity;
  }

  async insertClassCentre(
    datum: ClassCentreDatum,
    insertedBy: string | null = null,
  ): Promise<ClassCentreEntity> {
    const { centreId, classId } = datum;
    const rows = await this.databaseService.query(
      `
        INSERT INTO class_centres (centre_id, class_id, created_at, created_by) 
        VALUES ($2, $3, NOW(), $1) 
        RETURNING *;
      `,
      [insertedBy, centreId, classId],
    );
    const entities = rows.map((r) => ClassCentreEntity.fromObject(r));
    return entities[0];
  }

  async insertClassTeacher(
    datum: ClassTeacherDatum,
    insertedBy: string | null = null,
  ): Promise<ClassTeacherEntity> {
    const { classId, teacherId, isFormTeacher } = datum;
    const rows = await this.databaseService.query(
      `
        INSERT INTO class_teachers (class_id, teacher_id, is_form_teacher, created_at, created_by) 
        VALUES ($2, $3, $4, NOW(), $1) 
        RETURNING *;
      `,
      [insertedBy, classId, teacherId, isFormTeacher],
    );
    const entities = rows.map((r) => ClassTeacherEntity.fromObject(r));
    return entities[0];
  }

  async insertClassStudent(
    datum: ClassStudentDatum,
    insertedBy: string | null = null,
  ): Promise<ClassStudentEntity> {
    const { classId, studentId } = datum;
    const rows = await this.databaseService.query(
      `
        INSERT INTO class_students (class_id, student_id, created_at, created_by) 
        VALUES ($2, $3, NOW(), $1) 
        RETURNING *;
      `,
      [insertedBy, classId, studentId],
    );
    const entities = rows.map((r) => ClassStudentEntity.fromObject(r));
    return entities[0];
  }

  async updateById(
    classId: string,
    datum: ClassDatum,
    updatedBy: string | null = null,
  ): Promise<ClassEntity> {
    const { centreId: newCentreId, dayTime: newDayTime } = datum;
    await this.databaseService.query(
      `
        UPDATE classes SET day_time = $3, updated_at = NOW(), updated_by = $1
        WHERE id = $2;
      `,
      [updatedBy, classId, newDayTime],
    );
    const classCentre = await this.getClassCentreByClassId(classId);
    const { datum: classCentreDatum } = classCentre;
    const { centreId: oldCentreId } = classCentreDatum;
    if (newCentreId !== oldCentreId) {
      await this.deleteClassCentreByClassId(classId);
      await this.insertClassCentre({ centreId: newCentreId, classId });
    }
    const updatedEntity = await this.getById(classId);
    return updatedEntity;
  }

  async deleteById(
    classId: string,
    deletedBy: string | null = null,
  ): Promise<ClassEntity> {
    const entity = await this.getById(classId);
    await this.deleteClassCentreByClassId(classId, deletedBy);
    return entity;
  }

  async deleteClassCentreByClassId(
    classId: string,
    deletedBy: string | null = null,
  ): Promise<void> {
    await this.databaseService.query(
      `
        UPDATE class_centres SET deleted_at = NOW(), deleted_by = $1
        WHERE deleted_at IS NULL AND class_id = $2;
      `,
      [deletedBy, classId],
    );
  }
}
