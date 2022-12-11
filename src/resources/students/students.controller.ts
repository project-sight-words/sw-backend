import * as Uuid from "utils/uuid";
import { StudentsService } from "./students.service";
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseArrayPipe,
  Post,
  Put,
} from "@nestjs/common";
import {
  CreateStudentDto,
  StudentDto,
  UpdateStudentDto,
} from "./dto/students.dto";

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
  async create(
    @Body(new ParseArrayPipe({ items: CreateStudentDto }))
    body: CreateStudentDto[],
  ): Promise<StudentDto[]> {
    const students = await this.studentsService.createStudents(body);
    return students;
  }

  @Put(":id")
  async updateById(
    @Param("id") id: string,
    @Body() body: UpdateStudentDto,
  ): Promise<StudentDto> {
    const isUuid = Uuid.test(id);
    if (!isUuid)
      throw new BadRequestException("Invalid student UUID provided.");
    const student = await this.studentsService.updateById(id, body);
    return student;
  }
}
