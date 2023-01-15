import { CentreEntity } from "entities/centre.entity";
import { CentresRepository } from "resources/centres/centres.repository";
import { ClassesRepository } from "./classes.repository";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import {
  ClassDatum,
  ClassEntity,
  ClassStudentDatum,
  ClassStudentEntity,
  ClassTeacherDatum,
  ClassTeacherEntity,
} from "entities/class.entity";

@Injectable()
export class ClassesService {
  constructor(
    private classesRepository: ClassesRepository,
    private centresRepository: CentresRepository,
  ) {}

  async get(): Promise<ClassEntity[]> {
    const entities = await this.classesRepository.get();
    return entities;
  }

  async searchById(id: string): Promise<ClassEntity[]> {
    const entities = await this.classesRepository.searchById(id);
    return entities;
  }

  async getClassesOfCentres(
    centreEntities: CentreEntity[],
  ): Promise<Map<string, ClassEntity[]>> {
    const centreIds = new Set<string>();
    centreEntities.forEach((centreEntity) => {
      const { identifier } = centreEntity;
      const { id: centreId } = identifier;
      centreIds.add(centreId);
    });
    const classEntities: ClassEntity[] =
      await this.classesRepository.getByCentreIds(centreIds);
    const centreClassListMap = new Map<string, ClassEntity[]>();
    centreIds.forEach((centreId) => centreClassListMap.set(centreId, []));
    classEntities.forEach((classEntity) => {
      const { datum: classObject } = classEntity;
      const { centreId } = classObject;
      const centreClassEntityList = centreClassListMap.get(centreId);
      if (!centreClassEntityList) throw new InternalServerErrorException();
      centreClassEntityList.push(classEntity);
    });
    return centreClassListMap;
  }

  async getCentreEntityMapOfClass(
    entity: ClassEntity,
  ): Promise<Map<string, CentreEntity>> {
    const centreEntityMap = this.getCentreEntityMapOfClasses([entity]);
    return centreEntityMap;
  }

  async getCentreEntityMapOfClasses(
    entities: ClassEntity[],
  ): Promise<Map<string, CentreEntity>> {
    const centreIds = new Set<string>();
    entities.forEach((entity) => {
      const { datum: classObjcect } = entity;
      const { centreId } = classObjcect;
      centreIds.add(centreId);
    });
    const centreEntities = await this.centresRepository.getByIds(centreIds);
    const centreEntityMap = new Map<string, CentreEntity>();
    centreEntities.forEach((centreEntity) => {
      const { identifier } = centreEntity;
      const { id } = identifier;
      centreEntityMap.set(id, centreEntity);
    });
    return centreEntityMap;
  }

  async create(
    datum: ClassDatum,
    createdBy: string | null = null,
  ): Promise<ClassEntity> {
    const entity = await this.classesRepository.insert(datum, createdBy);
    return entity;
  }

  async createClassTeacher(
    datum: ClassTeacherDatum,
    createdBy: string | null = null,
  ): Promise<ClassTeacherEntity> {
    const classTeacherEntity = await this.classesRepository.insertClassTeacher(
      datum,
      createdBy,
    );
    return classTeacherEntity;
  }

  async createClassStudent(
    datum: ClassStudentDatum,
    createdBy: string | null = null,
  ): Promise<ClassStudentEntity> {
    const classStudentEntity = await this.classesRepository.insertClassStudent(
      datum,
      createdBy,
    );
    return classStudentEntity;
  }

  async updateById(id: string, datum: ClassDatum): Promise<ClassEntity> {
    const entity = await this.classesRepository.updateById(id, datum);
    return entity;
  }

  async deleteById(id: string) {
    const entity = await this.classesRepository.deleteById(id);
    return entity;
  }
}
