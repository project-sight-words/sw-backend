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
import { isValidAudio, isValidImage } from "utils/file";

@Controller("/words")
export class WordsController {
  constructor(private readonly wordsService: WordsService) {}

  // TODO check the file upload max size
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

    const uploadedImage: Express.Multer.File = files.image[0];
    const uploadedAudio: Express.Multer.File = files.audio[0];

    if (!isValidImage(uploadedImage.mimetype))
      throw new BadRequestException(
        "Only .jpg, .jpeg, .png, or .gif files supported",
      );

    if (!isValidAudio(uploadedAudio.mimetype))
      throw new BadRequestException(`Only .wav or .mp3 files supported`);

    return await this.wordsService.createWord(
      body.word,
      body.definition,
      body.sentence,
      uploadedImage,
      uploadedAudio,
      body.difficulty,
    );
  }
}
