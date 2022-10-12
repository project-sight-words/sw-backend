import {
  Controller,
  Get,
  Delete,
  Post,
  Param,
  Body,
  Put,
  UsePipes,
} from "@nestjs/common";
import { Authorization } from "decorators/authorization.decorator";
import { CreateTeacherDto } from "./dto/teachers.dto";
import { TeachersService } from "./teachers.service";
import { ValidationPipe } from "@nestjs/common/pipes";

@Controller("teachers")
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Post()
  @UsePipes(ValidationPipe)
  async createTeacher(
    @Body() teacherData: CreateTeacherDto,
  ): Promise<CreateTeacherDto> {
    const user_id = "user_id";
    return await this.teachersService.createTeacher(user_id, teacherData);
  }

  @Get()
  async getTeachers(): Promise<CreateTeacherDto[]> {
    return await this.teachersService.getTeachers();
  }

  @Get(":id")
  async getTeacher(@Param("id") id: string): Promise<CreateTeacherDto> {
    return await this.teachersService.getTeacher(id);
  }

  @Put(":id")
  async updateTeacher(
    @Body() teacherData: CreateTeacherDto,
  ): Promise<CreateTeacherDto> {
    const user_id = "user_id";
    return await this.teachersService.updateTeacher(user_id, teacherData);
  }

  @Delete(":id")
  async deleteTeacher(@Param("id") id: string): Promise<CreateTeacherDto> {
    const user_id = "user_id";
    return await this.teachersService.deleteTeacher(id, user_id);
  }
}
