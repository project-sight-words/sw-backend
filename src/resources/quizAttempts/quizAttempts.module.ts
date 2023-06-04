import { Module } from "@nestjs/common";
import { QuizAttemptsService } from "./quizAttempts.service";
import { QuizAttemptsController } from "./quizAttempts.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { QuizAttempt } from "entities/quizAttempt.entity";

@Module({
  imports: [TypeOrmModule.forFeature([QuizAttempt])],
  controllers: [QuizAttemptsController],
  providers: [QuizAttemptsService],
})
export class QuizAttemptsModule {}
