import { CentresModule } from "resources/centres/centres.module";
import { ClassesController } from "./classes.controller";
import { ClassesService } from "./classes.service";
import {
  Class,
  ClassCentre,
  ClassStudent,
  ClassTeacher,
} from "entities/class.entities";
import { Module } from "@nestjs/common";
import { StudentsModule } from "resources/students/students.module";
import { TeachersModule } from "resources/teachers/teachers.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Teacher } from "entities/teacher.entities";
import { Student } from "entities/student.entities";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Class,
      ClassStudent,
      ClassTeacher,
      ClassCentre,
      Teacher,
      Student,
    ]),
    CentresModule,
    StudentsModule,
    TeachersModule,
  ],
  controllers: [ClassesController],
  providers: [ClassesService],
})
export class ClassesModule {}
