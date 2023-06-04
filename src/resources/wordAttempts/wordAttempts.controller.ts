import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Put,
} from "@nestjs/common";
import { WordAttemptsService } from "./wordAttempts.service";
import {
  CreateWordAttemptDto,
  DetailedWordAttemptDto,
  UpdateWordAttemptDto,
  WordAttemptDto,
} from "./dto/wordAttempt.dto";
import { plainToInstance } from "utils/transformer";
import { FileInterceptor } from "@nestjs/platform-express";
import { isValidImage } from "utils/file";

@Controller("word_attempts")
export class WordAttemptsController {
  constructor(private readonly wordAttemptsService: WordAttemptsService) {}

  @Post()
  async create(
    @Body() createWordAttemptDto: CreateWordAttemptDto,
  ): Promise<WordAttemptDto> {
    const entity = await this.wordAttemptsService.create(
      createWordAttemptDto.lessonWordId,
      createWordAttemptDto.studentId,
    );
    return plainToInstance(WordAttemptDto, entity);
  }

  @Get()
  async findAll(): Promise<DetailedWordAttemptDto[]> {
    const entities = await this.wordAttemptsService.get();
    return DetailedWordAttemptDto.fromEntities(entities);
  }

  @Get(":id")
  async findOne(@Param("id") id: string): Promise<DetailedWordAttemptDto> {
    const entity = await this.wordAttemptsService.getById(id);
    return DetailedWordAttemptDto.fromEntity(entity);
  }

  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body() updateWordAttemptDto: UpdateWordAttemptDto,
  ): Promise<WordAttemptDto> {
    const entity = await this.wordAttemptsService.update(
      id,
      updateWordAttemptDto.progress,
      updateWordAttemptDto.imageApprovalStatus,
    );
    return plainToInstance(WordAttemptDto, entity);
  }

  @Post(":id/personalised_image")
  @UseInterceptors(FileInterceptor("personalisedImage"))
  async uploadPersonalisedImage(
    @Param("id") id: string,
    @UploadedFile() personalisedImage: Express.Multer.File,
  ): Promise<WordAttemptDto> {
    this.validatedPersonalisedImage(personalisedImage);
    const entity = await this.wordAttemptsService.updatePersonalisedImage(
      id,
      personalisedImage,
    );
    return plainToInstance(WordAttemptDto, entity);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.wordAttemptsService.remove(+id);
  }

  private validatedPersonalisedImage(
    personalisedImage: Express.Multer.File | undefined,
  ): Express.Multer.File {
    if (!personalisedImage) {
      throw new BadRequestException("Missing image upload");
    }

    if (!isValidImage(personalisedImage.mimetype)) {
      throw new BadRequestException(
        "Only .jpg, .jpeg, .png, or .gif files supported",
      );
    }

    return personalisedImage;
  }
}
