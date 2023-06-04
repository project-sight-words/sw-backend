import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Student, StudentUser } from "entities/student.entities";
import { User } from "entities/user.entities";
import { UsersModule } from "resources/users/users.module";
import { UsersRepository } from "resources/users/users.repository";
import { StudentsController } from "./students.controller";
import { StudentsService } from "./students.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Student, StudentUser]),
    UsersModule,
  ],
  controllers: [StudentsController],
  providers: [UsersRepository, StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}
