import { Controller, Get, Post, Param, Body, UsePipes } from "@nestjs/common";
import { Authorization } from "decorators/authorization.decorator";
import { CreateTeacherDto } from "./dto/teachers.dto";
import { TeachersService } from "./teachers.service";
import { ValidationPipe } from "@nestjs/common/pipes";
import { Teacher } from "entities/teacher.entities";

@Controller("teachers")
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Post()
  @UsePipes(ValidationPipe)
  async createTeacher(
    @Authorization() userId: string,
    @Body() teacherData: CreateTeacherDto,
  ): Promise<Teacher> {
    return await this.teachersService.createTeacher(userId, teacherData);
  }

  @Get()
  async getTeachers(@Authorization() userId: string): Promise<Teacher[]> {
    return await this.teachersService.getTeachers();
  }

  @Get(":id")
  async getTeacher(
    @Authorization() userId: string,
    @Param("id") id: string,
  ): Promise<Teacher> {
    return await this.teachersService.getTeacher(id);
  }

  // @Put(":id")
  // updateTeacher(
  //   @Param("id") id: number,
  //   @Body("staff_id") staff_id: string,
  //   @Body("name") name: string,
  // ): void {
  //update information of a teacher
  // return this.teachersService.updateTeacher(id, staff_id, name);
  // return "Teacher updated";
  // }

  // @Delete(":id")
  // deleteTeacher(@Param("id") id: number): void {
  //   return this.teachersService.deleteTeacher(id);
  // }
}
