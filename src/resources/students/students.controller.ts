import * as Uuid from "utils/uuid";
import { StudentsService } from "./students.service";
import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseArrayPipe,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import {
  CreateStudentDto,
  StudentDto,
  UpdateStudentDto,
} from "./dto/students.dto";
import { JwtAuthGuard } from "../authentication/jwt-auth.guard";

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
    const isUuid = Uuid.test(id);
    if (!isUuid) throw new NotFoundException();
    const student = await this.studentsService.getById(id);
    return student;
  }

  @Post()
  @HttpCode(201)
  async create(
    @Body(new ParseArrayPipe({ items: CreateStudentDto }))
    body: CreateStudentDto[],
  ): Promise<StudentDto[]> {
    const students = await this.studentsService.createMany(body);
    return students;
  }

  @Put(":id")
  async updateById(
    @Param("id") id: string,
    @Body() body: UpdateStudentDto,
  ): Promise<StudentDto> {
    const isUuid = Uuid.test(id);
    if (!isUuid) throw new NotFoundException();
    const student = await this.studentsService.updateById(id, body);
    return student;
  }
}
