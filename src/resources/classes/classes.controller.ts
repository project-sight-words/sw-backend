import * as Uuid from "utils/uuid";
import { ClassEntity } from "entities/class.entity";
import { ClassesService } from "./classes.service";
import { StudentsService } from "resources/students/students.service";
import { TeachersService } from "resources/teachers/teachers.service";
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import {
  ClassTeacherDto,
  DetailedClassDto,
  ClassDatumDto,
  ClassStudentDto,
} from "./dto/classes.dto";

@Controller("classes")
export class ClassesController {
  constructor(
    private readonly classesService: ClassesService,
    private readonly studentsService: StudentsService,
    private readonly teachersService: TeachersService,
  ) {}

  @Get()
  async get(): Promise<DetailedClassDto[]> {
    const entities: ClassEntity[] = await this.classesService.get();
    const [centreEntityMap, studentEntitiesMap, teacherEntitiesMap] =
      await Promise.all([
        this.classesService.getCentreEntityMapOfClasses(entities),
        this.classesService.getStudentEntitiesMapOfClasses(entities),
        this.classesService.getTeacherEntitiesMapOfClasses(entities),
      ]);
    const dtos = DetailedClassDto.fromClassEntitiesAndDetails(
      entities,
      centreEntityMap,
      studentEntitiesMap,
      teacherEntitiesMap,
    );
    return dtos;
  }

  @Get(":id")
  async getById(@Param("id") id: string): Promise<DetailedClassDto> {
    const isUuid = Uuid.test(id);
    if (!isUuid) throw new NotFoundException();
    const entities = await this.classesService.searchById(id);
    if (entities.length === 0) throw new NotFoundException();
    const entity = entities[0];
    const [centreEntityMap, studentEntitiesMap, teacherEntitiesMap] =
      await Promise.all([
        this.classesService.getCentreEntityMapOfClass(entity),
        this.classesService.getStudentEntitiesMapOfClass(entity),
        this.classesService.getTeacherEntitiesMapOfClass(entity),
      ]);
    const dto = DetailedClassDto.fromClassEntityAndDetails(
      entity,
      centreEntityMap,
      studentEntitiesMap,
      teacherEntitiesMap,
    );
    return dto;
  }

  @Post()
  async create(@Body() body: ClassDatumDto): Promise<DetailedClassDto> {
    const datum = ClassDatumDto.toClassDatum(body);
    const entity = await this.classesService.create(datum);
    const [centreEntityMap, studentEntitiesMap, teacherEntitiesMap] =
      await Promise.all([
        this.classesService.getCentreEntityMapOfClass(entity),
        this.classesService.getStudentEntitiesMapOfClass(entity),
        this.classesService.getTeacherEntitiesMapOfClass(entity),
      ]);
    const dto = DetailedClassDto.fromClassEntityAndDetails(
      entity,
      centreEntityMap,
      studentEntitiesMap,
      teacherEntitiesMap,
    );
    return dto;
  }

  @Post(":id/teachers")
  async createClassTeacher(
    @Param("id") classId: string,
    @Body() body: ClassTeacherDto,
  ): Promise<void> {
    const isUuid = Uuid.test(classId);
    if (!isUuid) throw new NotFoundException();
    const classesWithId = await this.classesService.searchById(classId);
    if (classesWithId.length === 0) throw new NotFoundException();
    const { teacherId } = body;
    const teachersWithId = [true /* TODO: Search for teachers with id */];
    if (teachersWithId.length === 0) throw new BadRequestException();
    const datum = ClassTeacherDto.toClassTeacherDatum(body, classId);
    await this.classesService.createClassTeacher(datum);
  }

  @Post(":id/students")
  async createClassStudent(
    @Param("id") classId: string,
    @Body() body: ClassStudentDto,
  ): Promise<void> {
    const isUuid = Uuid.test(classId);
    if (!isUuid) throw new NotFoundException();
    const classesWithId = await this.classesService.searchById(classId);
    if (classesWithId.length === 0) throw new NotFoundException();
    const { studentId } = body;
    const studentsWithId = [true /* TODO: Search for students with id */];
    if (studentsWithId.length === 0) throw new BadRequestException();
    const datum = ClassStudentDto.toClassStudentDatum(body, classId);
    await this.classesService.createClassStudent(datum);
  }

  @Put(":id")
  async updateByid(
    @Param("id") id: string,
    @Body() body: ClassDatumDto,
  ): Promise<DetailedClassDto> {
    const isUuid = Uuid.test(id);
    if (!isUuid) throw new NotFoundException();
    const entities = await this.classesService.searchById(id);
    if (entities.length === 0) throw new NotFoundException();
    const entity = await this.classesService.updateById(id, body);
    const [centreEntityMap, studentEntitiesMap, teacherEntitiesMap] =
      await Promise.all([
        this.classesService.getCentreEntityMapOfClass(entity),
        this.classesService.getStudentEntitiesMapOfClass(entity),
        this.classesService.getTeacherEntitiesMapOfClass(entity),
      ]);
    const dto = DetailedClassDto.fromClassEntityAndDetails(
      entity,
      centreEntityMap,
      studentEntitiesMap,
      teacherEntitiesMap,
    );
    return dto;
  }

  @Delete(":id")
  async deleteById(@Param("id") id: string): Promise<DetailedClassDto> {
    const isUuid = Uuid.test(id);
    if (!isUuid) throw new NotFoundException();
    const entities = await this.classesService.searchById(id);
    if (entities.length === 0) throw new NotFoundException();
    const deletingEntity = entities[0];
    const [centreEntityMap, studentEntitiesMap, teacherEntitiesMap] =
      await Promise.all([
        this.classesService.getCentreEntityMapOfClass(deletingEntity),
        this.classesService.getStudentEntitiesMapOfClass(deletingEntity),
        this.classesService.getTeacherEntitiesMapOfClass(deletingEntity),
      ]);
    const deletedEntity = await this.classesService.deleteById(id);
    const dto = DetailedClassDto.fromClassEntityAndDetails(
      deletedEntity,
      centreEntityMap,
      studentEntitiesMap,
      teacherEntitiesMap,
    );
    return dto;
  }

  @Delete(":id/teachers/:teacherId")
  async deleteClassTeacher(
    @Param("id") classId: string,
    @Param("teacherId") teacherId: string,
  ) {
    const classIdIsUuid = Uuid.test(classId);
    const teacherIdIsUuid = Uuid.test(teacherId);
    if (!classIdIsUuid || !teacherIdIsUuid) throw new NotFoundException();
    const classesWithId = await this.classesService.searchById(classId);
    if (classesWithId.length === 0) throw new NotFoundException();
    const teachersWithId = [true /* TODO: Search for teacher */];
    if (teachersWithId.length === 0) throw new NotFoundException();
    // TODO:
  }

  @Delete(":id/students/:studentId")
  async deleteClassStudent(
    @Param("id") classId: string,
    @Param("studentId") studentId: string,
  ) {
    const classIdIsUuid = Uuid.test(classId);
    const studentIdIsUuid = Uuid.test(studentId);
    if (!classIdIsUuid || !studentIdIsUuid) throw new NotFoundException();
    const classesWithId = await this.classesService.searchById(classId);
    if (classesWithId.length === 0) throw new NotFoundException();
    const studentsWithId = [true /* TODO: Search for student */];
    if (studentsWithId.length === 0) throw new NotFoundException();
    // TODO:
  }
}
