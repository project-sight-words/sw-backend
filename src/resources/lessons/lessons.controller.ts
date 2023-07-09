import * as Uuid from "utils/uuid";
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import { CreateLessonDto, LessonDto } from "./dto/lessons.dto";
import { LessonsService } from "./lessons.service";

@Controller("/lessons")
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get()
  async getByClassId(@Query("classId") classId: string): Promise<LessonDto[]> {
    const lessons = await this.lessonsService.findByClassId(classId);
    return LessonDto.fromLessons(lessons);
  }

  @Get("student")
  async getByStudentId(
    @Query("studentId") studentId: string,
  ): Promise<LessonDto[]> {
    const lessons = await this.lessonsService.findByStudentId(studentId);
    return LessonDto.fromLessons(lessons);
  }

  @Get(":id")
  async getById(@Param("id") id: string): Promise<LessonDto> {
    const isUuid = Uuid.test(id);
    if (!isUuid) throw new BadRequestException("Invalid UUID");

    const lesson = await this.lessonsService.findOneById(id);
    if (!lesson) throw new NotFoundException();

    return LessonDto.fromLesson(lesson);
  }

  @Post()
  @HttpCode(201)
  async create(@Body() body: CreateLessonDto): Promise<LessonDto> {
    const lesson = await this.lessonsService.create(
      body.startDate,
      body.endDate,
      body.classId,
    );
    return LessonDto.fromLesson(lesson);
  }

  @Put(":id")
  async updateById(
    @Param("id") id: string,
    @Body() body: CreateLessonDto,
  ): Promise<LessonDto> {
    const isUuid = Uuid.test(id);
    if (!isUuid) throw new BadRequestException("Invalid UUID");

    const lesson = await this.lessonsService.updateById(id, body); // TODO: add updatedBy
    if (!lesson) throw new NotFoundException();

    return LessonDto.fromLesson(lesson);
  }

  @Delete(":id")
  async deleteById(@Param("id") id: string): Promise<LessonDto> {
    const isUuid = Uuid.test(id);
    if (!isUuid) throw new BadRequestException("Invalid UUID");

    const lesson = await this.lessonsService.findOneById(id);
    if (!lesson) throw new NotFoundException();

    await this.lessonsService.deleteById(id);
    return LessonDto.fromLesson(lesson);
  }
}
