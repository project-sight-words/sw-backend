import { TeachersService } from "./teachers.service";
import {
  CreateTeacherDto,
  DeleteTeacherDto,
  GetTeacherDto,
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
  async get(): Promise<GetTeacherDto[]> {
    const teachers = await this.teachersService.get();
    return teachers;
  }

  @Get(":id")
  async getByStaffId(@Param("id") teacherId: string): Promise<GetTeacherDto> {
    const teacher = await this.teachersService.getByTeacherId(teacherId);
    return teacher;
  }

  @Put(":id")
  async updateByStaffId(
    @Param("id") teacherId: string,
    @Body() data: UpdateTeacherDto,
  ): Promise<UpdateTeacherDto> {
    const teacher = await this.teachersService.updateByStaffId(
      teacherId,
      null,
      data,
    );
    return teacher;
  }

  @Delete(":id")
  async deleteByStaffId(
    @Param("id") teacherId: string,
  ): Promise<DeleteTeacherDto> {
    const teacher = await this.teachersService.deleteByStaffId(teacherId, null);
    return teacher;
  }
}
