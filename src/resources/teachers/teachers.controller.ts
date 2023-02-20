import * as Uuid from "utils/uuid";
import { NotFoundException } from "@nestjs/common/exceptions";
import { TeachersService } from "./teachers.service";
import { CreateTeacherDto, TeacherDto } from "./dto/teachers.dto";
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseArrayPipe,
  Post,
  Put,
} from "@nestjs/common";

@Controller("teachers")
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Get()
  async get(): Promise<TeacherDto[]> {
    const teacherUsers = await this.teachersService.get();
    const teacherDtos = teacherUsers.map((tu) =>
      TeacherDto.fromTeacherUser(tu),
    );
    return teacherDtos;
  }

  @Get(":id")
  async getById(@Param("id") id: string): Promise<TeacherDto> {
    const isUuid = Uuid.test(id);
    if (!isUuid) throw new NotFoundException();

    const teacherUser = await this.teachersService.findOneById(id);
    if (!teacherUser) throw new NotFoundException();

    const teacherDto = TeacherDto.fromTeacherUser(teacherUser);
    return teacherDto;
  }

  @Post()
  @HttpCode(201)
  async create(
    @Body(new ParseArrayPipe({ items: CreateTeacherDto }))
    body: CreateTeacherDto[],
  ): Promise<TeacherDto[]> {
    const teacherUsers = await this.teachersService.createMany(body); // TODO: add createdBy

    const teacherDtos = teacherUsers.map((tu) =>
      TeacherDto.fromTeacherUser(tu),
    );
    return teacherDtos;
  }

  @Put(":id")
  async updateById(
    @Param("id") id: string,
    @Body() body: Omit<CreateTeacherDto, "email">,
  ): Promise<TeacherDto> {
    const isUuid = Uuid.test(id);
    if (!isUuid) throw new NotFoundException();

    const teacherUser = await this.teachersService.updateById(id, body); // TODO: add updatedBy
    if (!teacherUser) throw new NotFoundException();

    const teacherDto = TeacherDto.fromTeacherUser(teacherUser);
    return teacherDto;
  }

  @Delete(":id")
  async deleteById(@Param("id") id: string): Promise<TeacherDto> {
    const isUuid = Uuid.test(id);
    if (!isUuid) throw new NotFoundException();

    const teacherUser = await this.teachersService.findOneById(id);
    if (!teacherUser) throw new NotFoundException();

    await this.teachersService.deleteById(id);
    const teacherDto = TeacherDto.fromTeacherUser(teacherUser);
    return teacherDto;
  }
}
