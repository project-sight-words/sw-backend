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
    const adminUsers = await this.adminsService.get();
    const adminDtos = adminUsers.map((au) => AdminDto.fromAdminUser(au));
    return adminDtos;
  }

  @Get(":id")
  async getById(@Param("id") id: string): Promise<AdminDto> {
    const isUuid = Uuid.test(id);
    if (!isUuid) throw new NotFoundException();

    const adminUser = await this.adminsService.findOneById(id);
    if (!adminUser) throw new NotFoundException();

    const adminDto = AdminDto.fromAdminUser(adminUser);
    return adminDto;
  }

  @Post()
  @HttpCode(201)
  async create(
    @Body(new ParseArrayPipe({ items: CreateAdminDto }))
    body: CreateAdminDto[],
  ): Promise<AdminDto[]> {
    const adminUsers = await this.adminsService.createMany(body); // TODO: add createdBy

    const adminDtos = adminUsers.map((au) => AdminDto.fromAdminUser(au));
    return adminDtos;
  }

  @Delete(":id")
  async deleteById(@Param("id") id: string): Promise<AdminDto> {
    const isUuid = Uuid.test(id);
    if (!isUuid) throw new NotFoundException();

    const adminUser = await this.adminsService.findOneById(id);
    if (!adminUser) throw new NotFoundException();

    await this.adminsService.deleteById(id);
    const adminDto = AdminDto.fromAdminUser(adminUser);
    return adminDto;
  }
}
