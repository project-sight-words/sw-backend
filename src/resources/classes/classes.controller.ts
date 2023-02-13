import * as Uuid from "utils/uuid";
import { Class, ClassStudent, ClassTeacher } from "entities/class.entity";
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
import { plainToInstance } from "class-transformer";
import { StudentsService } from "resources/students/students.service";
import { TeachersService } from "resources/teachers/teachers.service";

@Controller("classes")
export class ClassesController {
  constructor(
    private readonly classesService: ClassesService,
    private readonly studentsService: StudentsService,
    private readonly teachersService: TeachersService,
  ) {}

  @Get()
  async get(): Promise<Class[]> {
    const classes = await this.classesService.get();
    return plainToInstance(Class, classes, { excludeExtraneousValues: true });
  }

  @Get(":id")
  async getById(@Param("id") id: string): Promise<Class> {
    const classEntity = await this.classesService.searchById(id);
    if (!classEntity) throw new NotFoundException();
    return plainToInstance(Class, classEntity, {
      excludeExtraneousValues: true,
    });
  }

  @Post()
  async create(@Body() body: Class): Promise<Class> {
    const classEntity = await this.classesService.create(body);
    return classEntity;
  }

  @Post(":id/teachers")
  async createClassTeacher(
    @Param("id") classId: string,
    @Body() body: ClassTeacher,
  ): Promise<void> {
    const isUuid = Uuid.test(classId);
    if (!isUuid) throw new NotFoundException();
    const { teacherId } = body;
    await this.classesService.searchById(classId);
    // await this.teachersService.getById(teacherId);  Use after Teachers refactor
    if (!classId || !teacherId) throw new NotFoundException();
    await this.classesService.addTeacherToClass(classId, teacherId);
  }

  @Post(":id/students")
  async createClassStudent(
    @Param("id") classId: string,
    @Body() body: ClassStudent,
  ): Promise<void> {
    const isUuid = Uuid.test(classId);
    if (!isUuid) throw new NotFoundException();
    const { studentId } = body;
    await this.classesService.searchById(classId);
    // await this.studentsService.getById(studentId); Use after Students refactor
    if (!classId || !studentId) throw new NotFoundException();
    await this.classesService.addStudentToClass(classId, studentId);
  }

  @Put(":id")
  async updateByid(
    @Param("id") id: string,
    @Body() body: Class,
  ): Promise<Class> {
    const isUuid = Uuid.test(id);
    if (!isUuid) throw new NotFoundException();
    const classEntity = await this.classesService.searchById(id);
    if (!classEntity) throw new NotFoundException();
    const entity = await this.classesService.updateById(id, body);
    return entity;
  }

  @Delete(":id")
  async deleteById(@Param("id") id: string): Promise<Class> {
    const isUuid = Uuid.test(id);
    if (!isUuid) throw new NotFoundException();
    const classEntity = await this.classesService.searchById(id);
    if (!classEntity) throw new NotFoundException();
    const deletedEntity = await this.classesService.deleteById(id);
    return deletedEntity;
  }

  @Delete(":id/teachers/:teacherId")
  async deleteClassTeacher(
    @Param("id") classId: string,
    @Param("teacherId") teacherId: string,
  ) {
    const classIdIsUuid = Uuid.test(classId);
    const teacherIdIsUuid = Uuid.test(teacherId);
    if (!classIdIsUuid || !teacherIdIsUuid) throw new NotFoundException();
    const classEntity = await this.classesService.searchById(classId);
    const teacher = await this.teachersService.getById(teacherId);
    if (!classEntity || !teacher) throw new NotFoundException();
    await this.classesService.removeTeacherFromClass(classId, teacherId);
  }

  @Delete(":id/students/:studentId")
  async deleteClassStudent(
    @Param("id") classId: string,
    @Param("studentId") studentId: string,
  ) {
    const classIdIsUuid = Uuid.test(classId);
    const studentIdIsUuid = Uuid.test(studentId);
    if (!classIdIsUuid || !studentIdIsUuid) throw new NotFoundException();
    const classEntity = await this.classesService.searchById(classId);
    const student = await this.studentsService.getById(studentId);
    if (!classEntity || !student) throw new NotFoundException();
    await this.classesService.removeStudentFromClass(classId, studentId);
  }

  @Get(":id/students")
  async getClassStudents(@Param("id") classId: string) {
    const students = await this.classesService.getStudentssInClass(classId);
    return students;
  }
}
