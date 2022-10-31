import { StudentDto, UpdateStudentDto } from "./dto/students.dto";
import { StudentsService } from "./students.service";
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
} from "@nestjs/common";

@Controller("students")
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  async getStudents(): Promise<StudentDto[]> {
    const students = await this.studentsService.getStudents();
    return students;
  }

  @Get(":id")
  async getStudentById(@Param("id") id: string): Promise<StudentDto> {
    const student = await this.studentsService.getStudentById(id);
    return student;
  }

  @Post()
  @HttpCode(201)
  async createStudent(@Body() studentDto: StudentDto): Promise<StudentDto> {
    const createdStudent = await this.studentsService.createStudent(studentDto);
    return createdStudent;
  }

  @Put(":id")
  async updateStudentById(
    @Param("id") id: string,
    @Body() updateStudentDto: UpdateStudentDto,
  ): Promise<StudentDto> {
    const updatedStudent = await this.studentsService.updateStudent(
      id,
      updateStudentDto,
    );
    return updatedStudent;
  }
}
