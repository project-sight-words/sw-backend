import * as Uuid from "utils/uuid";
import { AdminDto, CreateAdminDto } from "./dto/admins.dto";
import { AdminsService } from "./admins.service";
import { AdminUser } from "entities/admin.entities";
import { BadRequestException } from "@nestjs/common/exceptions";
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
    const adminUsers = await this.adminsService.get();
    return AdminDto.fromAdminUsers(adminUsers);
  }

  @Get(":id")
  async getById(@Param("id") id: string): Promise<AdminDto> {
    const isUuid = Uuid.test(id);
    if (!isUuid) throw new BadRequestException("Invalid UUID");

    const adminUser = await this.adminsService.findOneById(id);
    if (!adminUser) throw new NotFoundException();

    return AdminDto.fromAdminUser(adminUser);
  }

  @Post()
  @HttpCode(201)
  async create(
    @Body(new ParseArrayPipe({ items: CreateAdminDto }))
    body: CreateAdminDto[],
  ): Promise<AdminDto[]> {
    const results = await this.adminsService.createMany(body); // TODO: add createdBy
    if (results.length > 0 && results[0] instanceof AdminUser) {
      const adminUsers = results as AdminUser[];
      return AdminDto.fromAdminUsers(adminUsers);
    }
    throw new BadRequestException(results);
  }

  @Delete(":id")
  async deleteById(@Param("id") id: string): Promise<AdminDto> {
    const isUuid = Uuid.test(id);
    if (!isUuid) throw new BadRequestException("Invalid UUID");

    const adminUser = await this.adminsService.findOneById(id);
    if (!adminUser) throw new NotFoundException();

    await this.adminsService.deleteById(id);
    return AdminDto.fromAdminUser(adminUser);
  }
}
