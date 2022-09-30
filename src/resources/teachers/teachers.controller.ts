import { Controller, Get, Post, Param, Body, UsePipes } from "@nestjs/common";
import { CreateTeacherDto } from "./dto/create.dto";
import { TeachersService } from "./teachers.service";
import { ValidationPipe } from "@nestjs/common/pipes";
import { TeachersEntity } from "src/entities/teacher.entities";

@Controller("teachers")
export class TeachersController {
  //instantiate a teacher service
  constructor(private teachersService: TeachersService) {}

  @Post()
  @UsePipes(ValidationPipe)
  createTeacher(
    @Body() teacherData: CreateTeacherDto,
  ): Promise<TeachersEntity> {
    return this.teachersService.createTeacher(teacherData);
  }

  // @Get()
  // getTeachers(): string {
  //teacher array
  // return this.teachersService.getTeacher();
  // return "Find All teachers";
  // }

  @Get(":id")
  getTeacher(@Param("id") id: number): Promise<TeachersEntity> {
    //returns a teacher
    return this.teachersService.getTeacher(id);
    // return "Return a {params.id} teacher";
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
