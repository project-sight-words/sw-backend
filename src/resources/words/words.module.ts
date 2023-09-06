import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MediaModule } from "resources/media/media.module";
import { WordsController } from "resources/words/words.controller";
import { WordsService } from "resources/words/words.service";
import { Audio, Image, Word } from "entities/word.entities";

@Module({
  imports: [TypeOrmModule.forFeature([Word, Audio, Image]), MediaModule],
  controllers: [WordsController],
  providers: [WordsService],
  exports: [WordsService],
})
export class WordsModule {}
