import { Module } from "@nestjs/common";
import { WordAttemptsService } from "./wordAttempts.service";
import { WordAttemptsController } from "./wordAttempts.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WordAttempt } from "entities/wordAttempt.entity";
import { MediaModule } from "resources/media/media.module";

@Module({
  imports: [TypeOrmModule.forFeature([WordAttempt]), MediaModule],
  controllers: [WordAttemptsController],
  providers: [WordAttemptsService],
})
export class WordAttemptsModule {}
