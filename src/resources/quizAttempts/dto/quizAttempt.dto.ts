import { PickType } from "@nestjs/mapped-types";
import { Expose } from "class-transformer";
import { IsNotEmpty, IsNumber, IsUUID } from "class-validator";

export class QuizAttemptDto {
  @Expose()
  @IsUUID()
  id!: string;

  @Expose()
  @IsNotEmpty()
  attemptedAt!: Date;

  @Expose()
  @IsNotEmpty()
  scoreOneTotal!: number;

  @Expose()
  @IsNotEmpty()
  scoreTwoTotal!: number;

  @Expose()
  @IsNumber()
  @IsNotEmpty()
  scoreOne!: number | null;

  @Expose()
  @IsNumber()
  @IsNotEmpty()
  scoreTwo!: number | null;

  @Expose()
  unsubmittedAt!: Date | null;

  @Expose()
  unsubmittedBy!: string | null;

  @Expose()
  @IsUUID()
  wordAttemptId!: string;
}

export class CreateQuizAttemptDto extends PickType(QuizAttemptDto, [
  "wordAttemptId",
  "scoreOne",
  "scoreTwo",
]) {}

export class UpdateQuizAttemptDto extends PickType(QuizAttemptDto, [
  "scoreOne",
  "scoreTwo",
]) {}
