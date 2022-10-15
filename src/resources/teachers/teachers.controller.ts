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
import { CreateTeacherDto, UpdateTeacherDto } from "./dto/teachers.dto";
import { TeachersService } from "./teachers.service";

@Controller("teachers")
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Post()
  @HttpCode(201)
  async create(@Body() data: CreateTeacherDto): Promise<CreateTeacherDto> {
    const user_id = "user_id";
    const teacher = await this.teachersService.createTeacher(user_id, data);
    return teacher;
  }

  @Get()
  async getAll(): Promise<CreateTeacherDto[]> {
    return await this.teachersService.getTeachers();
  }

  @Get(":id")
  async get(@Param("id") id: string): Promise<CreateTeacherDto> {
    return await this.teachersService.getTeacher(id);
  }

  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body() data: UpdateTeacherDto,
  ): Promise<CreateTeacherDto> {
    const user_id = "user_id";
    return await this.teachersService.updateTeacher(id, user_id, data);
  }

  @Delete(":id")
  async delete(@Param("id") id: string): Promise<CreateTeacherDto> {
    const user_id = "user_id";
    return await this.teachersService.deleteTeacher(id, user_id);
  }
}
