import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import {
  CreateWordDto,
  EditWordDto,
  WordDto,
} from "resources/words/dto/words.dto";
import { WordsService } from "resources/words/words.service";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { isValidAudio, isValidImage } from "utils/file";
import { CompressionType } from "@aws-sdk/client-s3";

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
      image: Express.Multer.File[];
      audio: Express.Multer.File[];
    },
    @Body() body: CreateWordDto,
  ): Promise<WordDto> {
    const [uploadedImage, uploadedAudio] = this.validateWordFiles(files);

    const createdWord = await this.wordsService.create(
      body.word,
      body.definition || body.sentence,
      body.sentence,
      uploadedImage,
      uploadedAudio,
      body.comment,
      body.difficulty,
    );

    return WordDto.from(createdWord);
  }

  @Get()
  async getWordBank(): Promise<WordDto[]> {
    const words = await this.wordsService.findAll();
    return words.map((w) => WordDto.from(w));
  }

  @Get(":id")
  async getWord(@Param("id") id: string): Promise<WordDto> {
    const word = await this.wordsService.findOneById(id);
    if (!word) throw new NotFoundException("Word not found");
    return WordDto.from(word);
  }

  @Post(":id")
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: "image", maxCount: 1 },
      { name: "audio", maxCount: 1 },
    ]),
  )
  async updateWord(
    @Param("id") id: string,
    @UploadedFiles()
    files: {
      image: Express.Multer.File[];
      audio: Express.Multer.File[];
    },
    @Body() body: EditWordDto,
  ): Promise<WordDto> {
    const [uploadedImage, uploadedAudio] = this.validateWordFiles(files);

    const editedWord = await this.wordsService.update(
      id,
      body.sentence,
      body.comment,
      body.difficulty,
      uploadedImage,
      uploadedAudio,
    );
    return WordDto.from(editedWord);
  }

  @Delete(":id")
  async deleteWord(@Param("id") id: string) {
    const word = await this.wordsService.findOneById(id);
    if (!word) throw new NotFoundException("Word not found");
    await this.wordsService.deleteById(id);
    return WordDto.from(word);
  }

  private validateWordFiles(files: {
    image: Express.Multer.File[];
    audio: Express.Multer.File[];
  }): [Express.Multer.File, Express.Multer.File] {
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

    return [uploadedImage, uploadedAudio];
  }
}
