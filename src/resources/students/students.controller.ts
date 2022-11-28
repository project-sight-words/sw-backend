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
  Post,
  Put,
} from "@nestjs/common";
import { IsUUID } from "class-validator";

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

  // TODO: Accept JSON array
  @Post()
  @HttpCode(201)
  async create(@Body() studentDto: CreateStudentDto): Promise<StudentDto> {
    const student = await this.studentsService.create(studentDto);
    return student;
  }

  @Put(":id")
  async updateById(
    @Param("id") id: string,
    @Body() updateStudentDto: UpdateStudentDto,
  ): Promise<StudentDto> {
    const regexExp =
      /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
    if (!regexExp.test(id)) {
      throw new BadRequestException("Invalid student UUID provided.");
    }

    const student = await this.studentsService.updateById(id, updateStudentDto);
    return student;
  }
}
