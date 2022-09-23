import { DatabaseModule } from "database/database.module";
import { Module } from "@nestjs/common";
import { UsersRepository } from "./users.repository";

@Module({
  imports: [DatabaseModule],
  providers: [UsersRepository],
  exports: [UsersRepository],
})
export class UsersModule {}
