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
import { BadRequestException } from "@nestjs/common/exceptions";

@Controller("teachers")
export class TeachersController {
  private readonly uuidRegexExp =
    /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;

  constructor(private readonly teachersService: TeachersService) {}

  @Post()
  @HttpCode(201)
  async create(@Body() data: CreateTeacherDto[]): Promise<TeacherDto[]> {
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
    const teacher = await this.teachersService.getByTeacherId(
      teacherId,
      this.uuidRegexExp.test(teacherId),
    );
    return teacher;
  }

  @Put(":id")
  async updateByTeacherId(
    @Param("id") teacherId: string,
    @Body() data: UpdateTeacherDto,
  ): Promise<TeacherDto> {
    console.log(teacherId);
    if (!this.uuidRegexExp.test(teacherId)) {
      throw new BadRequestException("Invalid teacher UUID provided");
    }
    const teacher = await this.teachersService.updateByTeacherId(
      teacherId,
      null,
      data,
    );
    return teacher;
  }

  @Delete(":id")
  async deleteByTeacherId(@Param("id") teacherId: string): Promise<TeacherDto> {
    if (!this.uuidRegexExp.test(teacherId)) {
      throw new BadRequestException("Invalid teacher UUID provided");
    }
    const teacher = await this.teachersService.deleteByTeacherId(
      teacherId,
      null,
    );
    return teacher;
  }
}
