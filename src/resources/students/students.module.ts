import { DatabaseModule } from "database/database.module";
import { Module } from "@nestjs/common";
import { StudentsController } from "./students.controller";
import { StudentsService } from "./students.service";
import { UsersModule } from "resources/users/users.module";
import { UsersRepository } from "resources/users/users.repository";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Student, StudentUser } from "entities/student.entities";
import { UsersService } from "../users/users.service";
import { User } from "entities/user.entities";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Student, StudentUser]),
    DatabaseModule,
    UsersModule,
  ],
  controllers: [StudentsController],
  providers: [UsersService, UsersRepository, StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}
