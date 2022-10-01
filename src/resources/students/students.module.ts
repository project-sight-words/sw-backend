import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../database/database.module";
import { DatabaseService } from "../../database/database.service";
import { UsersModule } from "../users/users.module";
import { UsersRepository } from "../users/users.repository";
import { StudentsController } from "./students.controller";
import { StudentsService } from "./students.service";

@Module({
  imports: [DatabaseModule, UsersModule],
  controllers: [StudentsController],
  providers: [DatabaseService, UsersRepository, StudentsService],
})
export class StudentsModule {}
