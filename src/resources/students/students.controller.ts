import * as Uuid from "utils/uuid";
import { StudentsService } from "./students.service";
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseArrayPipe,
  Post,
  Put,
} from "@nestjs/common";
import {
  CreateStudentDto,
  CreateStudentErrorDto,
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
    const isUuid = Uuid.test(id);
    if (!isUuid) throw new NotFoundException();
    const student = await this.studentsService.findOneById(id);
    return student;
  }

  @Post()
  @HttpCode(201)
  async create(
    @Body(new ParseArrayPipe({ items: CreateStudentDto }))
    body: CreateStudentDto[],
  ): Promise<StudentDto[]> {
    const result: StudentDto[] | CreateStudentErrorDto[] =
      await this.studentsService.createMany(body);
    if (result instanceof Array<CreateStudentErrorDto>)
      throw new BadRequestException(result);
    return result;
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

  @Delete(":id")
  async deleteById(@Param("id") id: string): Promise<StudentDto> {
    const isUuid = Uuid.test(id);
    if (!isUuid) throw new NotFoundException();
    // TODO: Change this to search by id
    const student = await this.studentsService.findOneById(id);
    await this.studentsService.deleteById(id);
    return student;
  }
}
