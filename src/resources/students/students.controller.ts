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
  async get(): Promise<StudentDto[]> {
    const students = await this.studentsService.get();
    return students;
  }

  @Get(":id")
  async getById(@Param("id") id: string): Promise<StudentDto> {
    const student = await this.studentsService.getById(id);
    return student;
  }

  @Post()
  @HttpCode(201)
  async create(@Body() studentDto: StudentDto): Promise<StudentDto> {
    const student = await this.studentsService.create(studentDto);
    return student;
  }

  @Put(":id")
  async updateById(
    @Param("id") id: string,
    @Body() updateStudentDto: UpdateStudentDto,
  ): Promise<StudentDto> {
    const student = await this.studentsService.updateById(id, updateStudentDto);
    return student;
  }
}
