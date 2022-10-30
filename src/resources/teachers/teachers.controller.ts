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
    return await this.teachersService.getAll();
  }

  @Get(":id")
  async get(@Param("id") staffId: string): Promise<GetTeacherDto> {
    return await this.teachersService.get(staffId);
  }

  @Put(":id")
  async update(
    @Param("id") staffId: string,
    @Body() data: UpdateTeacherDto,
  ): Promise<UpdateTeacherDto> {
    const requestId = null;
    return await this.teachersService.update(staffId, requestId, data);
  }

  @Delete(":id")
  async delete(@Param("id") staffId: string): Promise<DeleteTeacherDto> {
    const requestId = null;
    return await this.teachersService.delete(staffId, requestId);
  }
}
