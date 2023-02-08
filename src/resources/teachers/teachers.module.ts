import { DatabaseModule } from "database/database.module";
import { Module } from "@nestjs/common";
import { TeachersController } from "./teachers.controller";
import { TeachersRepository } from "./teachers.repository";
import { TeachersService } from "./teachers.service";
import { UsersRepository } from "resources/users/users.repository";

@Module({
  imports: [DatabaseModule],
  controllers: [TeachersController],
  providers: [TeachersRepository, TeachersService, UsersRepository],
  exports: [TeachersService],
})
export class TeachersModule {}
