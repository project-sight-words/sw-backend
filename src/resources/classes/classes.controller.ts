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
    @Param("id") class_id: string,
    @Body() addTeacherToClassDto: AddTeacherToClassDto,
  ) {
    return this.classesService.addTeacherToClass(
      class_id,
      addTeacherToClassDto.teacherId,
      addTeacherToClassDto.isFormTeacher ?? false,
    );
  }

  @Get(":id/teachers")
  getTeachersFromClass(@Param("id") class_id: string) {
    return this.classesService.getTeachersFromClass(class_id);
  }

  @Delete(":id/teachers/:teacherId")
  removeTeacherFromClass(
    @Param("id") class_id: string,
    @Param("teacherId") teacher_id: string,
  ) {
    return this.classesService.removeTeacherFromClass(class_id, teacher_id);
  }

  @Post(":id/students")
  addStudentToClass(
    @Param("id") class_id: string,
    @Body() addStudentToClassDto: AddStudentToClassDto,
  ) {
    return this.classesService.addStudentToClass(
      class_id,
      addStudentToClassDto.studentId,
    );
  }

  @Get(":id/students")
  getStudentsFromClass(@Param("id") class_id: string) {
    return this.classesService.getStudentsFromClass(class_id);
  }

  @Delete(":id/students/:studentId")
  removeStudentFromClass(
    @Param("id") class_id: string,
    @Param("studentId") student_id: string,
  ) {
    return this.classesService.removeStudentFromClass(class_id, student_id);
  }
}
