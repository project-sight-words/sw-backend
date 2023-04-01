import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import { CreateWordDto } from "resources/words/words.dto";
import { WordsService } from "resources/words/words.service";
import { FileFieldsInterceptor } from "@nestjs/platform-express";

@Controller("/words")
export class WordsController {
  constructor(private readonly wordsService: WordsService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: "image", maxCount: 1 },
      { name: "audio", maxCount: 1 },
    ]),
  )
  async createWord(
    @UploadedFiles()
    files: {
      image?: Express.Multer.File[];
      audio?: Express.Multer.File[];
    },
    @Body() body: CreateWordDto,
  ) {
    if (!files.image) throw new BadRequestException("Missing image upload");
    if (!files.audio) throw new BadRequestException("Missing audio upload");

    return await this.wordsService.createWord(
      body.word,
      body.definition,
      body.sentence,
      files.image[0],
      files.audio[0],
      body.difficulty,
    );
  }
}
