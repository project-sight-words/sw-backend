import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MediaModule } from "resources/media/media.module";
import { WordsController } from "resources/words/words.controller";
import { WordsService } from "resources/words/words.service";

@Module({
  imports: [TypeOrmModule.forFeature([]), MediaModule],
  controllers: [WordsController],
  providers: [WordsService],
  exports: [WordsService],
})
export class WordsModule {}
