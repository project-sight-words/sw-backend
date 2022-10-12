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
import { StudentDto, UpdateStudentDto } from "./dto/students.dto";
import { StudentsService } from "./students.service";

@Controller("students")
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  async getStudents(): Promise<StudentDto[]> {
    return await this.studentsService.getStudents();
  }

  @Get(":id")
  async getStudentById(@Param("id") id: string): Promise<StudentDto> {
    return await this.studentsService.getStudentById(id);
  }

  @Post()
  @HttpCode(201)
  async createStudent(@Body() studentDto: StudentDto): Promise<StudentDto> {
    return await this.studentsService.createStudent(studentDto);
  }

  @Put(":id")
  async updateStudentById(
    @Param("id") id: string,
    @Body() updateStudentDto: UpdateStudentDto,
  ): Promise<StudentDto> {
    return await this.studentsService.updateStudent(id, updateStudentDto.name);
  }
}
