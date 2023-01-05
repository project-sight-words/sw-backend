import { Module } from "@nestjs/common";
import { DatabaseModule } from "database/database.module";
import { UsersModule } from "resources/users/users.module";
import { UsersRepository } from "resources/users/users.repository";
import { StudentsController } from "./students.controller";
import { StudentsRepository } from "./students.repository";
import { StudentsService } from "./students.service";

@Module({
  imports: [DatabaseModule, UsersModule],
  controllers: [StudentsController],
  providers: [UsersRepository, StudentsService, StudentsRepository],
  exports: [StudentsRepository],
})
export class StudentsModule {}
