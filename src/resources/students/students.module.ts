import { Module } from "@nestjs/common";
import { DatabaseModule } from "database/database.module";
import { UsersModule } from "resources/users/users.module";
import { UsersRepository } from "resources/users/users.repository";
import { StudentsController } from "./students.controller";
import { StudentsService } from "./students.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Student, StudentUser } from "entities/student.entities";
import { UsersService } from "../users/users.service";
import { User } from "entities/user.entities";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Student, StudentUser]),
    UsersModule,
  ],
  controllers: [StudentsController],
  providers: [UsersService, StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}
