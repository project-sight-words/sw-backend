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
  Post,
  Put,
} from "@nestjs/common";
import { Authorization } from "decorators/authorization.decorator";

@Controller("teachers")
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Post()
  @HttpCode(201)
  async create(
    @Body() data: CreateTeacherDto[],
    @Authorization() userId: string,
  ): Promise<TeacherDto[]> {
    const teachers = await this.teachersService.bulkCreate(userId, data);
    return teachers;
  }

  @Get()
  async get(): Promise<TeacherDto[]> {
    const teachers = await this.teachersService.get();
    return teachers;
  }

  @Get(":id")
  async getByTeacherId(@Param("id") teacherId: string): Promise<TeacherDto> {
    const teacher = await this.teachersService.getByTeacherId(teacherId);
    return teacher;
  }

  @Put(":id")
  async updateByTeacherId(
    @Param("id") teacherId: string,
    @Body() data: UpdateTeacherDto,
    @Authorization() userId: string,
  ): Promise<TeacherDto> {
    const teacher = await this.teachersService.updateByTeacherId(
      teacherId,
      userId,
      data,
    );
    return teacher;
  }

  @Delete(":id")
  async deleteByTeacherId(
    @Param("id") teacherId: string,
    @Authorization() userId: string,
  ): Promise<TeacherDto> {
    const teacher = await this.teachersService.deleteByTeacherId(
      teacherId,
      userId,
    );
    return teacher;
  }
}
