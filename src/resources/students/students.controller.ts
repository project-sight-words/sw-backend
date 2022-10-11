import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
} from "@nestjs/common";
import { StudentDto } from "./dto/students.dto";
import { StudentsService } from "./students.service";

@Controller("students")
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) { }

  @Get()
  async getStudents(): Promise<StudentDto[]> {
    return await this.studentsService.getStudents();
  }

  @Get(":id")
  async getStudentById(@Param("id") id: string): Promise<StudentDto> {
    return await this.studentsService.getStudentById(id);
  }

  @Post()
  @HttpCode(204)
  async createStudent(@Body() studentDto: StudentDto): Promise<StudentDto> {
    return await this.studentsService.createStudent(studentDto);
  }

  @Put(":id")
  async updateStudentById(
    @Param("id") id: string,
    @Body() studentDto: StudentDto,
  ): Promise<StudentDto> {
    if (id != studentDto.studentId) throw new BadRequestException();
    return await this.studentsService.updateStudent(studentDto);
  }
}
