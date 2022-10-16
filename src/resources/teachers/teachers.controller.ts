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
import { CreateTeacherDto } from "./dto/teachers.dto";
import { TeachersService } from "./teachers.service";

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
  async getAll(): Promise<CreateTeacherDto[]> {
    return await this.teachersService.getAll();
  }

  @Get(":id")
  async get(@Param("id") staffId: string): Promise<CreateTeacherDto> {
    return await this.teachersService.get(staffId);
  }

  @Put(":id")
  async update(
    @Param("id") staffId: string,
    @Body() data: CreateTeacherDto,
  ): Promise<CreateTeacherDto> {
    const requestId = null;
    return await this.teachersService.update(staffId, requestId, data);
  }

  @Delete(":id")
  async delete(@Param("id") staffId: string): Promise<CreateTeacherDto> {
    const requestId = null;
    return await this.teachersService.delete(staffId, requestId);
  }
}
