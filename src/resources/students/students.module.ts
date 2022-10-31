import { DatabaseModule } from "database/database.module";
import { DatabaseService } from "database/database.service";
import { Module } from "@nestjs/common";
import { StudentsController } from "./students.controller";
import { StudentsRepository } from "./students.repository";
import { StudentsService } from "./students.service";
import { UsersModule } from "resources/users/users.module";
import { UsersRepository } from "resources/users/users.repository";

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
