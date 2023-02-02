import { CentreEntity } from "entities/centre.entity";
import { CentresRepository } from "resources/centres/centres.repository";
import { ClassesRepository } from "./classes.repository";
import { getOrError } from "utils/map";
import { StudentEntity } from "entities/student.entities";
import { StudentsService } from "resources/students/students.service";
import { TeacherEntity } from "entities/teacher.entities";
import { TeachersService } from "resources/teachers/teachers.service";
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
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
    private centresRepository: CentresRepository, // TODO: Change this to service
    private studentsService: StudentsService,
    private teachersService: TeachersService,
  ) {}

  private readonly loggerService = new Logger("ClassesService");

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

  async getStudentEntitiesMapOfClass(
    entity: ClassEntity,
  ): Promise<Map<string, StudentEntity[]>> {
    const studentEntitiesMap = this.getStudentEntitiesMapOfClasses([entity]);
    return studentEntitiesMap;
  }

  async getStudentEntitiesMapOfClasses(
    entities: ClassEntity[],
  ): Promise<Map<string, StudentEntity[]>> {
    const classIds = new Set<string>();
    entities.forEach((entity) => {
      const { identifier } = entity;
      const { id } = identifier;
      classIds.add(id);
    });
    const classStudentEntities =
      await this.classesRepository.getClassStudentsByClassIds(classIds);
    const studentIds = new Set<string>();
    classStudentEntities.forEach((entity) => {
      const { datum } = entity;
      const { studentId } = datum;
      studentIds.add(studentId);
    });
    const studentEntities = await this.studentsService.searchByIds(studentIds);
    const studentEntityMap = new Map<string, StudentEntity>();
    studentEntities.forEach((entity) => {
      const { identifier } = entity;
      const { id } = identifier;
      studentEntityMap.set(id, entity);
    });
    const studentEntitesMap = new Map<string, StudentEntity[]>();
    classStudentEntities.forEach((entity) => {
      const { datum } = entity;
      const { classId, studentId } = datum;
      const studentEntity = getOrError(
        studentEntityMap,
        studentId,
        this.loggerService,
      );
      let studentEntitiesArray = studentEntitesMap.get(classId);
      if (!studentEntitiesArray) {
        studentEntitiesArray = [];
        studentEntitesMap.set(classId, studentEntitiesArray);
      }
      studentEntitiesArray.push(studentEntity);
    });
    return studentEntitesMap;
  }

  async getTeacherEntitiesMapOfClass(
    entity: ClassEntity,
  ): Promise<Map<string, TeacherEntity[]>> {
    const teachersEntitiesMap = this.getTeacherEntitiesMapOfClasses([entity]);
    return teachersEntitiesMap;
  }

  async getTeacherEntitiesMapOfClasses(
    entities: ClassEntity[],
  ): Promise<Map<string, TeacherEntity[]>> {
    const classIds = new Set<string>();
    entities.forEach((entity) => {
      const { identifier } = entity;
      const { id } = identifier;
      classIds.add(id);
    });
    const classTeacherEntities =
      await this.classesRepository.getClassTeachersByClassIds(classIds);
    const teacherIds = new Set<string>();
    classTeacherEntities.forEach((entity) => {
      const { datum } = entity;
      const { teacherId } = datum;
      teacherIds.add(teacherId);
    });
    const teacherEntities = await this.teachersService.searchByIds(teacherIds);
    const teacherEntityMap = new Map<string, TeacherEntity>();
    teacherEntities.forEach((entity) => {
      const { identifier } = entity;
      const { id } = identifier;
      teacherEntityMap.set(id, entity);
    });
    const teacherEntitesMap = new Map<string, TeacherEntity[]>();
    classTeacherEntities.forEach((entity) => {
      const { datum } = entity;
      const { classId, teacherId } = datum;
      const studentEntity = getOrError(
        teacherEntityMap,
        teacherId,
        this.loggerService,
      );
      let teacherEntitiesArray = teacherEntitesMap.get(classId);
      if (!teacherEntitiesArray) {
        teacherEntitiesArray = [];
        teacherEntitesMap.set(classId, teacherEntitiesArray);
      }
      teacherEntitiesArray.push(studentEntity);
    });
    return teacherEntitesMap;
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
