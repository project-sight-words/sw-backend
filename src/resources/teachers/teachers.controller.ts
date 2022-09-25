import {
  Controller,
  Get,
  Post,
  Delete,
  Put,
  Param,
  Body,
  UsePipes,
} from "@nestjs/common";
import { CreateTeacherDto } from "./dto/create.dto";

import { TeachersService } from "./teachers.service";
import { ValidationPipe } from "@nestjs/common/pipes";

@Controller("teachers")
export class TeachersController {
  //teacher object need to make a model?
  //instantiate a teacher service
  constructor(private teachersService: TeachersService) {}
  @Post()
  @UsePipes(ValidationPipe)
  createTeacher(
    // @Body("staff_id") staff_id: string,
    // @Body("name") name: string,
    @Body() teacherData: CreateTeacherDto,
  ) {
    return { data: teacherData };
    // return this.teachersService.createTeacher(staff_id, name);
    // return "Teacher created";
  }

  @Get()
  getTeachers(): string {
    //teacher array
    return this.teachersService.getTeachers();
    // return "Find All teachers";
  }

  @Get(":id")
  getTeacher(@Param("id") id: number): string {
    //returns a teacher
    return this.teachersService.getTeacher(id);
    // return "Return a {params.id} teacher";
  }

  @Put(":id")
  updateTeacher(
    @Param("id") id: number,
    @Body("staff_id") staff_id: string,
    @Body("name") name: string,
  ): void {
    //update information of a teacher
    return this.teachersService.updateTeacher(id, staff_id, name);
    // return "Teacher updated";
  }

  @Delete(":id")
  deleteTeacher(@Param("id") id: number): void {
    return this.teachersService.deleteTeacher(id);
  }
}
