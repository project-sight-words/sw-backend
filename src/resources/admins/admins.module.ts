import { AdminsService } from "./admins.service";
import { Module } from "@nestjs/common";
import { AdminsController } from "./admins.controller";
import { AdminsRepository } from "./admins.repository";
import { DatabaseModule } from "database/database.module";
import { UsersModule } from "resources/users/users.module";

@Module({
  imports: [DatabaseModule, UsersModule],
  controllers: [AdminsController],
  providers: [AdminsService, AdminsRepository],
  exports: [AdminsService],
})
export class AdminsModule {}
