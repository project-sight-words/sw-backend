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
    @Authorization() userId: string,
    @Body() teacherData: CreateTeacherDto,
  ): Promise<CreateTeacherDto> {
    return await this.teachersService.createTeacher(userId, teacherData);
  }

  @Get()
  async getTeachers(
    @Authorization() userId: string,
  ): Promise<CreateTeacherDto[]> {
    return await this.teachersService.getTeachers();
  }

  @Get(":id")
  async getTeacher(
    @Authorization() userId: string,
    @Param("id") id: string,
  ): Promise<CreateTeacherDto> {
    return await this.teachersService.getTeacher(id);
  }

  @Put(":id")
  async updateTeacher(
    @Authorization() userId: string,
    @Body() teacherData: CreateTeacherDto,
  ): Promise<CreateTeacherDto> {
    return await this.teachersService.updateTeacher(userId, teacherData);
  }

  @Delete(":id")
  async deleteTeacher(
    @Authorization() userId: string,
    @Param("id") id: string,
  ): Promise<CreateTeacherDto> {
    return await this.teachersService.deleteTeacher(id, userId);
  }
}
