import * as Uuid from "utils/uuid";
import { Class } from "entities/class.entities";
import { ClassesService } from "./classes.service";
import { StudentDto } from "resources/students/dto/students.dto";
import { StudentsService } from "resources/students/students.service";
import { TeacherDto } from "resources/teachers/dto/teachers.dto";
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
  Query,
} from "@nestjs/common";
import {
  CreateClassCentreDto,
  CreateClassDto,
  CreateClassStudentDto,
  CreateClassTeacherDto,
  DetailedClassDto,
  UpdateClassDto,
} from "./dto/classes.dto";

@Controller("classes")
export class ClassesController {
  constructor(
    private readonly classesService: ClassesService,
    private readonly studentsService: StudentsService,
    private readonly teachersService: TeachersService,
  ) {}

  @Get()
  async get(
    @Query("studentId") studentId?: string,
    @Query("teacherId") teacherId?: string,
  ): Promise<DetailedClassDto[]> {
    let classes: Class[];
    if (studentId && teacherId)
      classes = await this.classesService.getClassesByStudentAndTeacher(
        studentId,
        teacherId,
      );
    else if (studentId)
      classes = await this.classesService.getClassesByStudent(studentId);
    else if (teacherId)
      classes = await this.classesService.getClassesByTeacher(teacherId);
    else classes = await this.classesService.get();
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
    const classEntity = await this.classesService.findOneById(classId);
    const studentEntity = await this.teachersService.findOneById(teacherId);

    if (!classEntity || !studentEntity) throw new NotFoundException();
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
    const isStudentUuid = Uuid.test(studentId);
    if (!isStudentUuid) throw new NotFoundException();

    const classEntity = await this.classesService.findOneById(classId);
    const studentEntity = await this.studentsService.findOneById(studentId);

    if (!classEntity || !studentEntity) throw new NotFoundException();
    await this.classesService.addStudentToClass(classId, studentId);
  }

  @Put(":id")
  async updateByid(
    @Param("id") id: string,
    @Body() body: UpdateClassDto,
  ): Promise<Class> {
    const entity = await this.classesService.updateById(id, body);
    return entity;
  }

  @Delete(":id")
  async deleteById(@Param("id") id: string): Promise<Class> {
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
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!classEntity || !student) throw new NotFoundException();
    await this.classesService.removeStudentFromClass(classId, studentId);
  }

  @Get(":id/students")
  async getClassStudents(@Param("id") classId: string): Promise<StudentDto[]> {
    const students = await this.classesService.getStudentsInClass(classId);
    return StudentDto.fromMany(students);
  }

  @Get(":id/teachers")
  async getClassTeachers(@Param("id") classId: string): Promise<TeacherDto[]> {
    const teachers = await this.classesService.getTeachersInClass(classId);
    return TeacherDto.fromTeacherUsers(teachers);
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
