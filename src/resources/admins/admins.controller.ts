import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
} from "@nestjs/common";
import { AdminsService } from "./admins.service";
import { CreateAdminDto } from "./dto/createAdmin.dto";

@Controller("admins")
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Post()
  @HttpCode(201)
  async create(@Body() data: CreateAdminDto) {
    const admin = this.adminsService.create(data);
    return admin;
  }

  @Get()
  async getAll() {
    const admins = this.adminsService.getAll();
    return admins;
  }

  @Get(":id")
  async getById(@Param("id") id: string) {
    const admin = this.adminsService.getById(id);
    return admin;
  }

  @Delete(":id")
  async deleteById(@Param("id") id: string) {
    const admin = this.adminsService.deleteById(id);
    return admin;
  }
}
