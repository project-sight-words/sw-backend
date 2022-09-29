import { Module } from "@nestjs/common";
import { DatabaseModule } from "database/database.module";
import { DatabaseService } from "database/database.service";
import { UsersModule } from "resources/users/users.module";
import { UsersRepository } from "resources/users/users.repository";
import { StudentsController } from "./students.controller";

@Module({
  imports: [DatabaseModule, UsersModule],
  controllers: [StudentsController],
  providers: [DatabaseService, UsersRepository]
})
export class StudentsModule {}