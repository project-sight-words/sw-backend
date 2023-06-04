import { Module } from "@nestjs/common";
import { Teacher, TeacherUser } from "entities/teacher.entities";
import { TeachersController } from "./teachers.controller";
import { TeachersService } from "./teachers.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "entities/user.entities";
import { UsersModule } from "resources/users/users.module";
import { UsersService } from "resources/users/users.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Teacher, TeacherUser]),
    UsersModule,
  ],
  controllers: [TeachersController],
  providers: [UsersService, TeachersService],
  exports: [TeachersService],
})
export class TeachersModule {}
