import { Module } from "@nestjs/common";
import { DatabaseModule } from "database/database.module";
import { DatabaseService } from "database/database.service";
import { UsersRepository } from "resources/users/users.repository";
import { TeachersController } from "./teachers.controller";
import { TeachersRepository } from "./teachers.repository";
import { TeachersService } from "./teachers.service";

@Module({
  imports: [DatabaseModule],
  controllers: [TeachersController],
  providers: [
    TeachersService,
    DatabaseService,
    UsersRepository,
    TeachersRepository,
  ],
})
export class TeachersModule {}
