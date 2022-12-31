import * as Uuid from "utils/uuid";
import { NotFoundException } from "@nestjs/common/exceptions";
import { TeachersService } from "./teachers.service";
import {
  CreateTeacherDto,
  TeacherDto,
  UpdateTeacherDto,
} from "./dto/teachers.dto";
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseArrayPipe,
  Post,
  Put,
} from "@nestjs/common";

@Controller("teachers")
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Post()
  @HttpCode(201)
  async create(
    @Body(new ParseArrayPipe({ items: CreateTeacherDto }))
    body: CreateTeacherDto[],
  ): Promise<TeacherDto[]> {
    const teachers = await this.teachersService.createMany(body);
    return teachers;
  }

  @Get()
  async get(): Promise<TeacherDto[]> {
    const teachers = await this.teachersService.get();
    return teachers;
  }

  @Get(":id")
  async getById(@Param("id") id: string): Promise<TeacherDto> {
    const isUuid = Uuid.test(id);
    if (!isUuid) throw new NotFoundException();
    const teacher = await this.teachersService.getById(id);
    return teacher;
  }

  @Put(":id")
  async updateById(
    @Param("id") id: string,
    @Body() body: UpdateTeacherDto,
  ): Promise<TeacherDto> {
    const isUuid = Uuid.test(id);
    if (!isUuid) throw new NotFoundException();
    const teacher = await this.teachersService.updateByTeacherId(id, body);
    return teacher;
  }

  @Delete(":id")
  async deleteById(@Param("id") id: string): Promise<TeacherDto> {
    const isUuid = Uuid.test(id);
    if (!isUuid) throw new NotFoundException();
    const teacher = await this.teachersService.deleteById(id);
    return teacher;
  }
}
