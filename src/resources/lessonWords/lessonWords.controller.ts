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
} from "@nestjs/common";
import { LessonWordsService } from "./lessonWords.service";
import {
  CreateLessonWordDto,
  GetLessonWordDto,
  LessonWordDto,
} from "./dto/lessonWords.dto";

@Controller("/lessonwords")
export class LessonWordsController {
  constructor(private readonly lessonWordsService: LessonWordsService) {}

  @Get()
  async getByLessonId(
    @Body() body: GetLessonWordDto,
  ): Promise<LessonWordDto[]> {
    const lessonWords = await this.lessonWordsService.findByLessonId(
      body.lessonId,
    );
    return LessonWordDto.fromLessonWords(lessonWords);
  }

  @Get(":id")
  async getById(@Param("id") id: string): Promise<LessonWordDto> {
    const isUuid = Uuid.test(id);
    if (!isUuid) throw new BadRequestException("Invalid UUID");

    const lessonWord = await this.lessonWordsService.findOneById(id);
    if (!lessonWord) throw new NotFoundException();

    return LessonWordDto.fromLessonWord(lessonWord);
  }

  @Post()
  @HttpCode(201)
  async create(@Body() body: CreateLessonWordDto): Promise<LessonWordDto> {
    const lessonWord = await this.lessonWordsService.create(
      body.wordId,
      body.lessonId,
    );
    return LessonWordDto.fromLessonWord(lessonWord);
  }

  @Delete(":id")
  async deleteById(@Param("id") id: string): Promise<LessonWordDto> {
    const isUuid = Uuid.test(id);
    if (!isUuid) throw new BadRequestException("Invalid UUID");

    const lessonWord = await this.lessonWordsService.findOneById(id);
    if (!lessonWord) throw new NotFoundException();

    await this.lessonWordsService.deleteById(id);
    return LessonWordDto.fromLessonWord(lessonWord);
  }
}
