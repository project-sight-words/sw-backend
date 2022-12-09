import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from "@nestjs/common";
import { ClassesService } from "./classes.service";
import {
  AddTeacherToClassDto,
  UpdateClassDto,
  AddStudentToClassDto,
} from "./dto/classes.dto";

@Controller("classes")
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  create(@Body() createClassDto: UpdateClassDto) {
    return this.classesService.create(createClassDto);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.classesService.findOne(id);
  }

  @Get()
  findAll() {
    return this.classesService.findAll();
  }

  @Put(":id")
  update(@Param("id") id: string, @Body() updateClassDto: UpdateClassDto) {
    return this.classesService.update(id, updateClassDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.classesService.remove(id);
  }

  @Post(":id/teachers")
  addTeacherToClass(
    @Param("id") classId: string,
    @Body() addTeacherToClassDto: AddTeacherToClassDto,
  ) {
    return this.classesService.addTeacherToClass(
      classId,
      addTeacherToClassDto.teacherId,
      addTeacherToClassDto.isFormTeacher,
    );
  }

  @Get(":id/teachers")
  getTeachersFromClass(@Param("id") classId: string) {
    return this.classesService.getTeachersFromClass(classId);
  }

  @Delete(":id/teachers/:teacherId")
  removeTeacherFromClass(
    @Param("id") classId: string,
    @Param("teacherId") teacherId: string,
  ) {
    return this.classesService.removeTeacherFromClass(classId, teacherId);
  }

  @Post(":id/students")
  addStudentToClass(
    @Param("id") classId: string,
    @Body() addStudentToClassDto: AddStudentToClassDto,
  ) {
    return this.classesService.addStudentToClass(
      classId,
      addStudentToClassDto.studentId,
    );
  }

  @Get(":id/students")
  getStudentsFromClass(@Param("id") classId: string) {
    return this.classesService.getStudentsFromClass(classId);
  }

  @Delete(":id/students/:studentId")
  removeStudentFromClass(
    @Param("id") classId: string,
    @Param("studentId") studentId: string,
  ) {
    return this.classesService.removeStudentFromClass(classId, studentId);
  }
}
