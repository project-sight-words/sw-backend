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

@Controller("teachers")
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Post()
  @HttpCode(201)
  async create(@Body() data: CreateTeacherDto[]): Promise<CreateTeacherDto[]> {
    const teachers = await this.teachersService.bulkCreate(null, data);
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

  //TODO: Accept authentication usage and requester's userID
  @Put(":id")
  async updateByTeacherId(
    @Param("id") teacherId: string,
    @Body() data: UpdateTeacherDto,
  ): Promise<TeacherDto> {
    const teacher = await this.teachersService.updateByTeacherId(
      teacherId,
      null,
      data,
    );
    return teacher;
  }

  //TODO: accept authentication usage and requester's userID
  @Delete(":id")
  async deleteByTeacherId(@Param("id") teacherId: string): Promise<TeacherDto> {
    const teacher = await this.teachersService.deleteByTeacherId(
      teacherId,
      null,
    );
    return teacher;
  }
}
