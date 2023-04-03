import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "entities/user.entities";
import { UsersRepository } from "./users.repository";
import { UsersService } from "./users.service";
import { DatabaseService } from "database/database.service";
import { DatabaseModule } from "database/database.module";

@Module({
  imports: [TypeOrmModule.forFeature([User]), DatabaseModule],
  providers: [UsersService, UsersRepository, DatabaseService],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
