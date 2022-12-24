import { AdminsController } from "./admins.controller";
import { AdminsRepository } from "./admins.repository";
import { AdminsService } from "./admins.service";
import { DatabaseModule } from "database/database.module";
import { Module } from "@nestjs/common";
import { UsersModule } from "resources/users/users.module";
import { UsersRepository } from "resources/users/users.repository";

@Module({
  imports: [DatabaseModule, UsersModule],
  controllers: [AdminsController],
  providers: [UsersRepository, AdminsService, AdminsRepository],
})
export class AdminsModule {}
