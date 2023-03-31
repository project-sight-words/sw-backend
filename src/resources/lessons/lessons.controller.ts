import * as Uuid from "utils/uuid";
import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
} from "@nestjs/common";
import { LessonsService } from "./lessons.service";
import { GetLessonDto, LessonDto } from "./dto/lessons.dto";

@Controller("/lessons")
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get()
  async getByClassId(@Body() body: GetLessonDto): Promise<LessonDto[]> {
    const lessons = await this.lessonsService.getByClassId(body.classId);
    return LessonDto.fromLessons(lessons);
  }

  @Get(":id")
  async getById(@Param("id") id: string): Promise<LessonDto> {
    const isUuid = Uuid.test(id);
    if (!isUuid) throw new NotFoundException();

    const lesson = await this.lessonsService.findOneById(id);
    if (!lesson) throw new NotFoundException();

    return LessonDto.fromLesson(lesson);
  }
}
