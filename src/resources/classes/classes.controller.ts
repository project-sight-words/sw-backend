import * as Uuid from "utils/uuid";
import { Class } from "entities/class.entities";
import { ClassesService } from "./classes.service";
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  NotFoundException,
} from "@nestjs/common";
import { StudentsService } from "resources/students/students.service";
import { TeachersService } from "resources/teachers/teachers.service";
import {
  CreateClassCentreDto,
  CreateClassDto,
  CreateClassStudentDto,
  CreateClassTeacherDto,
  DetailedClassDto,
  UpdateClassDto,
} from "./dto/classes.dto";
import { StudentEntityDto } from "resources/students/dto/students.dto";
import { plainToInstance } from "utils/transformer";

@Controller("classes")
export class ClassesController {
  constructor(
    private readonly classesService: ClassesService,
    private readonly studentsService: StudentsService,
    private readonly teachersService: TeachersService,
  ) {}

  @Get()
  async get(): Promise<DetailedClassDto[]> {
    const classes = await this.classesService.get();
    return DetailedClassDto.fromDetailedClassEntities(classes);
  }

  @Get(":id")
  async getById(@Param("id") id: string): Promise<DetailedClassDto> {
    const classEntity = await this.classesService.findOneById(id);
    if (!classEntity) throw new NotFoundException();
    return DetailedClassDto.fromDetailedClassEntity(classEntity);
  }

  @Post()
  async create(@Body() body: CreateClassDto): Promise<Class> {
    const classEntity = await this.classesService.create(body);
    return classEntity;
  }

  @Post(":id/teachers")
  async createClassTeacher(
    @Param("id") classId: string,
    @Body() body: CreateClassTeacherDto,
  ): Promise<void> {
    const isUuid = Uuid.test(classId);
    if (!isUuid) throw new NotFoundException();
    const { teacherId, isFormTeacher } = body;
    await this.classesService.findOneById(classId);
    // TODO: await this.teachersService.getById(teacherId);  Use after Teachers refactor
    if (!classId || !teacherId) throw new NotFoundException();
    await this.classesService.addTeacherToClass(
      classId,
      teacherId,
      isFormTeacher,
    );
  }

  @Post(":id/students")
  async createClassStudent(
    @Param("id") classId: string,
    @Body() body: CreateClassStudentDto,
  ): Promise<void> {
    const isUuid = Uuid.test(classId);
    if (!isUuid) throw new NotFoundException();
    const { studentId } = body;
    await this.classesService.findOneById(classId);
    // await this.studentsService.getById(studentId); Use after Students refactor
    if (!classId || !studentId) throw new NotFoundException();
    await this.classesService.addStudentToClass(classId, studentId);
  }

  @Put(":id")
  async updateByid(
    @Param("id") id: string,
    @Body() body: UpdateClassDto,
  ): Promise<Class> {
    // TODO: Confirm return body
    const isUuid = Uuid.test(id);
    if (!isUuid) throw new NotFoundException();
    const classEntity = await this.classesService.findOneById(id);
    if (!classEntity) throw new NotFoundException();
    const entity = await this.classesService.updateById(id, body);
    return entity;
  }

  @Delete(":id")
  async deleteById(@Param("id") id: string): Promise<Class> {
    // TODO: Confirm return body
    const isUuid = Uuid.test(id);
    if (!isUuid) throw new NotFoundException();
    const classEntity = await this.classesService.findOneById(id);
    if (!classEntity) throw new NotFoundException();
    const deletedEntity = await this.classesService.deleteById(id);
    return deletedEntity;
  }

  @Delete(":id/teachers/:teacherId")
  async deleteClassTeacher(
    @Param("id") classId: string,
    @Param("teacherId") teacherId: string,
  ): Promise<void> {
    const classIdIsUuid = Uuid.test(classId);
    const teacherIdIsUuid = Uuid.test(teacherId);
    if (!classIdIsUuid || !teacherIdIsUuid) throw new NotFoundException();
    const classEntity = await this.classesService.findOneById(classId);
    const teacher = await this.teachersService.findOneById(teacherId);
    if (!classEntity || !teacher) throw new NotFoundException();
    await this.classesService.removeTeacherFromClass(classId, teacherId);
  }

  @Delete(":id/students/:studentId")
  async deleteClassStudent(
    @Param("id") classId: string,
    @Param("studentId") studentId: string,
  ): Promise<void> {
    const classIdIsUuid = Uuid.test(classId);
    const studentIdIsUuid = Uuid.test(studentId);
    if (!classIdIsUuid || !studentIdIsUuid) throw new NotFoundException();
    const classEntity = await this.classesService.findOneById(classId);
    const student = await this.studentsService.findOneById(studentId);
    if (!classEntity || !student) throw new NotFoundException();
    await this.classesService.removeStudentFromClass(classId, studentId);
  }

  @Get(":id/students")
  async getClassStudents(
    @Param("id") classId: string,
  ): Promise<StudentEntityDto[]> {
    const students = await this.classesService.getStudentssInClass(classId);
    return plainToInstance(StudentEntityDto, students);
  }

  @Post(":id/centre")
  async addClassToCentre(
    @Param("id") id: string,
    @Body() classCentreDto: CreateClassCentreDto,
  ): Promise<void> {
    const isUuid = Uuid.test(id);
    if (!isUuid) throw new NotFoundException();
    const { centreId } = classCentreDto;
    const isCentreUuid = Uuid.test(centreId);
    if (!isCentreUuid) throw new NotFoundException();
    await this.classesService.addClassToCentre(centreId, id);
  }

  @Delete(":id/centre/:centreId")
  async removeClassFromCentre(
    @Param("id") id: string,
    @Param("centreId") centreId: string,
  ): Promise<void> {
    const isUuid = Uuid.test(id);
    if (!isUuid) throw new NotFoundException();
    const isCentreUuid = Uuid.test(centreId);
    if (!isCentreUuid) throw new NotFoundException();

    await this.classesService.removeClassFromCentre(centreId, id);
  }
}
