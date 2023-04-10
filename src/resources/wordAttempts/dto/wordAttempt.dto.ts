import { PickType } from "@nestjs/mapped-types";
import { Expose } from "class-transformer";
import {
  IsUUID,
  IsDate,
  IsEnum,
  IsString,
  IsNotEmpty,
  IsInstance,
} from "class-validator";
import {
  Progress,
  ImageApprovalStatus,
  WordAttempt,
} from "entities/wordAttempt.entity";
import { QuizAttemptDto } from "resources/quizAttempts/dto/quizAttempt.dto";
import { plainToInstance } from "utils/transformer";

export class UpdateWordAttemptDto {
  @Expose()
  @IsNotEmpty()
  @IsEnum(Progress)
  progress!: Progress;

  @Expose()
  @IsNotEmpty()
  @IsEnum(ImageApprovalStatus)
  imageApprovalStatus!: ImageApprovalStatus;
}

export class WordAttemptDto extends UpdateWordAttemptDto {
  @Expose()
  @IsUUID()
  id!: string;

  @Expose()
  @IsNotEmpty()
  @IsUUID()
  lessonWordId!: string;

  @Expose()
  @IsNotEmpty()
  @IsUUID()
  studentId!: string;

  @Expose()
  @IsNotEmpty()
  @IsDate()
  attemptedAt!: Date;

  @Expose()
  @IsNotEmpty()
  @IsString()
  personalisedImageLink!: string | null;
}

export class DetailedWordAttemptDto extends WordAttemptDto {
  @Expose()
  @IsInstance(QuizAttemptDto)
  quizAttempt!: QuizAttemptDto;

  static fromEntity(entity: WordAttempt) {
    const detailedWordAttemptDto = {
      ...entity,
      quizAttempt: plainToInstance(QuizAttemptDto, entity.quizAttempt),
    };
    return plainToInstance(DetailedWordAttemptDto, detailedWordAttemptDto);
  }

  static fromEntities(entities: WordAttempt[]) {
    return entities.map((entity) => DetailedWordAttemptDto.fromEntity(entity));
  }
}

export class CreateWordAttemptDto extends PickType(WordAttemptDto, [
  "lessonWordId",
  "studentId",
] as const) {}
