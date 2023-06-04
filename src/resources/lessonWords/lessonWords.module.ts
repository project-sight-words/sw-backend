import { LessonWord } from "entities/lessonWord.entities";
import { LessonWordsController } from "./lessonWords.controller";
import { LessonWordsService } from "./lessonWords.service";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [TypeOrmModule.forFeature([LessonWord])],
  controllers: [LessonWordsController],
  providers: [LessonWordsService],
  exports: [LessonWordsService],
})
export class LessonWordsModule {}
