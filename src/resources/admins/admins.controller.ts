import * as Uuid from "utils/uuid";
import { AdminsService } from "./admins.service";
import { AdminDto, CreateAdminDto } from "./dto/admins.dto";
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseArrayPipe,
  Post,
} from "@nestjs/common";

@Controller("admins")
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Get()
  async get(): Promise<AdminDto[]> {
    const admins = await this.adminsService.get();
    return admins;
  }

  @Get(":id")
  async getById(@Param("id") id: string): Promise<AdminDto> {
    const isUuid = Uuid.test(id);
    if (!isUuid) {
      throw new NotFoundException();
    }
    const admin = await this.adminsService.getById(id);
    return admin;
  }

  @Post()
  @HttpCode(201)
  async create(
    @Body(new ParseArrayPipe({ items: CreateAdminDto }))
    body: CreateAdminDto[],
  ): Promise<AdminDto[]> {
    const admins = await this.adminsService.createMany(body);
    return admins;
  }

  @Delete(":id")
  async deleteById(@Param("id") id: string): Promise<AdminDto> {
    const isUuid = Uuid.test(id);
    if (!isUuid) {
      throw new NotFoundException();
    }
    const admin = await this.adminsService.deleteById(id);
    return admin;
  }
}
