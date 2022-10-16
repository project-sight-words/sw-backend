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
    return await this.adminsService.create(data);
  }

  @Get()
  async getAll() {
    return await this.adminsService.getAll();
  }

  @Get(":id")
  async getById(@Param("id") id: string) {
    return await this.adminsService.getById(id);
  }

  @Delete(":id")
  async deleteById(@Param("id") id: string) {
    return await this.adminsService.deleteById(id);
  }
}
