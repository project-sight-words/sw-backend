import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { Access } from "decorators/abac.decorator";
import { Roles } from "decorators/roles.decorator";
import { ABAC } from "entities/abac.entities";
import { Role } from "entities/roles.entities";
import { JwtAuthGuard } from "resources/authentication/guards/jwt-auth.guard";
import {
  CreateTeacherDto,
  DeleteTeacherDto,
  GetTeacherDto,
  UpdateTeacherDto,
} from "./dto/teachers.dto";
import { TeachersService } from "./teachers.service";

@Controller("teachers")
@UseGuards(JwtAuthGuard)
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Post()
  @HttpCode(201)
  @Roles(Role.admin)
  async create(@Body() data: CreateTeacherDto): Promise<CreateTeacherDto> {
    const teacher = await this.teachersService.create(null, data);
    return teacher;
  }

  @Get()
  @Roles(Role.teacher, Role.admin)
  async get(): Promise<GetTeacherDto[]> {
    const teachers = await this.teachersService.get();
    return teachers;
  }

  @Get(":id")
  @Roles(Role.teacher, Role.admin)
  @Access(ABAC.TeacherSelf)
  async getByStaffId(@Param("id") staffId: string): Promise<GetTeacherDto> {
    const teacher = await this.teachersService.getByStaffId(staffId);
    return teacher;
  }

  @Put(":id")
  @Roles(Role.teacher, Role.admin)
  @Access(ABAC.TeacherSelf)
  async updateByStaffId(
    @Param("id") staffId: string,
    @Body() data: UpdateTeacherDto,
  ): Promise<UpdateTeacherDto> {
    const teacher = await this.teachersService.updateByStaffId(
      staffId,
      null,
      data,
    );
    return teacher;
  }

  @Delete(":id")
  @Roles(Role.admin)
  async deleteByStaffId(
    @Param("id") staffId: string,
  ): Promise<DeleteTeacherDto> {
    const teacher = await this.teachersService.deleteByStaffId(staffId, null);
    return teacher;
  }
}
