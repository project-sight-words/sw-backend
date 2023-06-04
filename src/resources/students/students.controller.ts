import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseArrayPipe,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import * as Uuid from "utils/uuid";
import { Roles } from "decorators/roles.decorator";
import { Role } from "entities/roles.entities";
import { JwtAuthGuard } from "resources/authentication/guards/jwt-auth.guard";
import {
  CreateStudentDto,
  DetailedStudentDto,
  StudentDto,
  UpdateStudentDto,
} from "./dto/students.dto";
import { StudentsService } from "./students.service";

@Controller("students")
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.teacher, Role.admin)
  async get(): Promise<StudentDto[]> {
    const students = await this.studentsService.get();
    return students;
  }

  @Get("/mass")
  async getWithClassesAndCentres() {
    const students = await this.studentsService.getWithClassesAndCentres();
    return DetailedStudentDto.fromMany(students);
  }

  @Get(":id")
  async getById(@Param("id") id: string): Promise<StudentDto> {
    const isUuid = Uuid.test(id);
    if (!isUuid) throw new NotFoundException();
    const student = await this.studentsService.findOneById(id);
    return student;
  }

  @Post()
  async create(
    @Body(new ParseArrayPipe({ items: CreateStudentDto }))
    body: CreateStudentDto[],
  ): Promise<StudentDto[]> {
    const result = await this.studentsService.createMany(body);
    if (result[0].hasOwnProperty("index"))
      throw new BadRequestException(result);

    return result as StudentDto[];
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
