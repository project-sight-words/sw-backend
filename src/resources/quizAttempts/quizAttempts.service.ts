import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { QuizAttempt } from "entities/quizAttempt.entity";
import { Repository } from "typeorm";

@Injectable()
export class QuizAttemptsService {
  constructor(
    @InjectRepository(QuizAttempt)
    private readonly quizAttemptsRepository: Repository<QuizAttempt>,
  ) {}

  async create(
    wordAttemptId: string,
    scoreOne: number | null,
    scoreTwo: number | null,
  ): Promise<QuizAttempt> {
    const quizAttempt = new QuizAttempt();
    quizAttempt.wordAttemptId = wordAttemptId;
    quizAttempt.scoreOne = scoreOne;
    quizAttempt.scoreTwo = scoreTwo;
    const entity = await this.quizAttemptsRepository.save(quizAttempt);
    return entity;
  }

  async get(): Promise<QuizAttempt[]> {
    const entities = await this.quizAttemptsRepository.find();
    return entities;
  }

  async getOneById(id: string) {
    const entity = await this.quizAttemptsRepository.findOneBy({ id });
    if (!entity) throw new NotFoundException();
    return entity;
  }

  async update(id: string, scoreOne: number | null, scoreTwo: number | null) {
    const quizAttempt = await this.getOneById(id);
    quizAttempt.scoreOne = scoreOne;
    quizAttempt.scoreTwo = scoreTwo;
    quizAttempt.attemptedAt = new Date();
    const entity = await this.quizAttemptsRepository.save(quizAttempt);
    return entity;
  }

  async unsubmit(id: string) {
    const quizAttempt = await this.getOneById(id);
    // Delete Quiz Attempt for now to simplify flow
    // No current use case for keeping track of unsubmission history

    // quizAttempt.scoreOne = null;
    // quizAttempt.scoreTwo = null;
    // quizAttempt.attemptedAt = null;
    // quizAttempt.unsubmittedAt = new Date();
    // quizAttempt.unsubmittedBy = null;
    // const entity = await this.quizAttemptsRepository.save(quizAttempt);

    const entity = await this.quizAttemptsRepository.remove(quizAttempt);
    return entity;
  }
}
