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
    const teacher = await this.teachersService.create(null, data);
    return teacher;
  }

  @Get()
  async get(): Promise<GetTeacherDto[]> {
    const teachers = await this.teachersService.get();
    return teachers;
  }

  @Get(":id")
  async getByStaffId(@Param("id") staffId: string): Promise<GetTeacherDto> {
    const teacher = await this.teachersService.getByStaffId(staffId);
    return teacher;
  }

  @Put(":id")
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
  async deleteByStaffId(
    @Param("id") staffId: string,
  ): Promise<DeleteTeacherDto> {
    const teacher = await this.teachersService.deleteByStaffId(staffId, null);
    return teacher;
  }
}
