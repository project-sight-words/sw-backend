import {
  CreateStudentDto,
  StudentDto,
  UpdateStudentDto,
} from "./dto/students.dto";
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
import { IsUUID } from "class-validator";

@Controller("students")
export class StudentsController {
  private readonly uuidRegexExp =
    /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;

  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  async get(): Promise<StudentDto[]> {
    const students = await this.studentsService.get();
    return students;
  }

  @Get(":id")
  async getById(@Param("id") id: string): Promise<StudentDto> {
    return await this.studentsService.getById(id, this.uuidRegexExp.test(id));
  }

  @Post()
  @HttpCode(201)
  async create(
    @Body(new ParseArrayPipe({ items: CreateStudentDto }))
    studentDtos: CreateStudentDto[],
  ): Promise<StudentDto[]> {
    const students = await this.studentsService.createStudents(studentDtos);
    return students;
  }

  @Put(":id")
  async updateById(
    @Param("id") id: string,
    @Body() updateStudentDto: UpdateStudentDto,
  ): Promise<StudentDto> {
    if (!this.uuidRegexExp.test(id)) {
      throw new BadRequestException("Invalid student UUID provided.");
    }

    const student = await this.studentsService.updateById(id, updateStudentDto);
    return student;
  }
}
