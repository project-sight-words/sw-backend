import { CentresModule } from "resources/centres/centres.module";
import { ClassesController } from "./classes.controller";
import { ClassesRepository } from "./classes.repository";
import { ClassesService } from "./classes.service";
import { Module } from "@nestjs/common";
import { StudentsModule } from "resources/students/students.module";
import { TeachersModule } from "resources/teachers/teachers.module";

@Module({
  imports: [CentresModule, StudentsModule, TeachersModule],
  controllers: [ClassesController],
  providers: [ClassesService, ClassesRepository],
})
export class ClassesModule {}
