import { Module } from "@nestjs/common";
import { AdminsController } from "./admins.controller";
import { AdminsRepository } from "./admins.repository";
import { AdminsService } from "./admins.service";
import { DatabaseModule } from "database/database.module";
import { UsersModule } from "resources/users/users.module";

@Module({
  imports: [DatabaseModule, UsersModule],
  controllers: [AdminsController],
  providers: [AdminsRepository, AdminsService],
  exports: [AdminsService],
})
export class AdminsModule {}
