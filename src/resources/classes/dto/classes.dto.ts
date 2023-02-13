import { PickType } from "@nestjs/mapped-types";
import { Class, ClassStudent, ClassTeacher } from "entities/class.entity";

export class CreateClassDto extends PickType(Class, [
  "startDay",
  "startTime",
  "endDay",
  "endTime",
] as const) {}

export class UpdateClassDto extends CreateClassDto {}

export class CreateClassStudentDto extends PickType(ClassStudent, [
  "studentId",
] as const) {}

export class CreateClassTeacherDto extends PickType(ClassTeacher, [
  "teacherId",
] as const) {}
