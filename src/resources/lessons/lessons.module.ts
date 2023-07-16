import { Lesson } from "entities/lesson.entities";
import { LessonsController } from "./lessons.controller";
import { LessonsService } from "./lessons.service";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ClassStudent } from "entities/class.entities";

@Module({
  imports: [TypeOrmModule.forFeature([Lesson, ClassStudent])],
  controllers: [LessonsController],
  providers: [LessonsService],
  exports: [LessonsService],
})
export class LessonsModule {}
