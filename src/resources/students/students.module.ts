import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../database/database.module";
import { DatabaseService } from "../../database/database.service";
import { UsersModule } from "../users/users.module";
import { UsersRepository } from "../users/users.repository";
import { StudentsController } from "./students.controller";
import { StudentsRepository } from "./students.repository";
import { StudentsService } from "./students.service";

@Module({
  imports: [DatabaseModule, UsersModule],
  controllers: [StudentsController],
  providers: [
    DatabaseService,
    UsersRepository,
    StudentsService,
    StudentsRepository,
  ],
})
export class StudentsModule {}
