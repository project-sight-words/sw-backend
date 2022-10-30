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
  async create(@Body() data: CreateTeacherDto): Promise<CreateTeacherDto> {
    const requestId = null;
    const teacher = await this.teachersService.create(requestId, data);
    return teacher;
  }

  @Get()
  async getAll(): Promise<GetTeacherDto[]> {
    const teachers = await this.teachersService.getAll();
    return teachers;
  }

  @Get(":id")
  async get(@Param("id") staffId: string): Promise<GetTeacherDto> {
    const teacher = await this.teachersService.get(staffId);
    return teacher;
  }

  @Put(":id")
  async update(
    @Param("id") staffId: string,
    @Body() data: UpdateTeacherDto,
  ): Promise<UpdateTeacherDto> {
    const teacher = await this.teachersService.update(staffId, null, data);
    return teacher;
  }

  @Delete(":id")
  async delete(@Param("id") staffId: string): Promise<DeleteTeacherDto> {
    const teacher = await this.teachersService.delete(staffId, null);
    return teacher;
  }
}
