import { Controller, Get, Post, Body, Param, Put } from "@nestjs/common";
import { QuizAttemptsService } from "./quizAttempts.service";
import {
  CreateQuizAttemptDto,
  QuizAttemptDto,
  UpdateQuizAttemptDto,
} from "./dto/quizAttempt.dto";
import { plainToInstance } from "utils/transformer";

@Controller("quiz_attempts")
export class QuizAttemptsController {
  constructor(private readonly quizAttemptsService: QuizAttemptsService) {}

  @Post()
  async create(@Body() createQuizAttemptDto: CreateQuizAttemptDto) {
    const entity = await this.quizAttemptsService.create(
      createQuizAttemptDto.wordAttemptId,
      createQuizAttemptDto.scoreOne,
      createQuizAttemptDto.scoreTwo,
    );
    return entity;
  }

  @Get()
  async findAll(): Promise<QuizAttemptDto[]> {
    const entities = await this.quizAttemptsService.get();
    return plainToInstance(QuizAttemptDto, entities);
  }

  @Get(":id")
  async findOne(@Param("id") id: string): Promise<QuizAttemptDto> {
    const entity = await this.quizAttemptsService.getOneById(id);
    return plainToInstance(QuizAttemptDto, entity);
  }

  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body() updateQuizAttemptDto: UpdateQuizAttemptDto,
  ): Promise<QuizAttemptDto> {
    const entity = await this.quizAttemptsService.update(
      id,
      updateQuizAttemptDto.scoreOne,
      updateQuizAttemptDto.scoreTwo,
    );
    return plainToInstance(QuizAttemptDto, entity);
  }

  @Post(":id/unsubmit")
  async unsubmit(@Param("id") id: string) {
    const entity = await this.quizAttemptsService.unsubmit(id);
    return plainToInstance(QuizAttemptDto, entity);
  }
}
