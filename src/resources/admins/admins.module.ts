import { AdminsController } from "./admins.controller";
import { AdminsService } from "./admins.service";
import { Module } from "@nestjs/common";
import { UsersModule } from "resources/users/users.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "entities/user.entities";
import { Admin, AdminUser } from "entities/admin.entities";
import { UsersService } from "resources/users/users.service";

@Module({
  imports: [TypeOrmModule.forFeature([User, Admin, AdminUser]), UsersModule],
  controllers: [AdminsController],
  providers: [UsersService, AdminsService],
  exports: [AdminsService],
})
export class AdminsModule {}
