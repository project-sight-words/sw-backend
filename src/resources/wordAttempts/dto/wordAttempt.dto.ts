import { PickType } from "@nestjs/mapped-types";
import { Expose } from "class-transformer";
import { IsUUID, IsDate, IsEnum, IsString, IsNotEmpty } from "class-validator";
import { Progress, ImageApprovalStatus } from "entities/wordAttempt.entity";

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

export class CreateWordAttemptDto extends PickType(WordAttemptDto, [
  "lessonWordId",
  "studentId",
] as const) {}
