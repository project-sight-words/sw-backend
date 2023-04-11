import * as Uuid from "utils/uuid";
import { CentresService } from "./centres.service";
import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
} from "@nestjs/common";
import { Centre } from "entities/centre.entities";
import { plainToInstance } from "utils/transformer";
import { ClassEntityDto } from "resources/classes/dto/classes.dto";
import { CentreEntityDto, UpdateCentreDto } from "./dto/centres.dto";

@Controller("centres")
export class CentresController {
  constructor(private readonly centresService: CentresService) {}

  // TODO: Not hydrated, Check and implement
  @Get()
  async get(): Promise<Centre[]> {
    const entities = await this.centresService.get();
    return entities;
  }

  @Get(":id")
  async getById(@Param("id") id: string): Promise<Centre> {
    const isUuid = Uuid.test(id);
    if (!isUuid) throw new NotFoundException();
    const entity = await this.centresService.getById(id);
    if (!entity) throw new NotFoundException();
    return entity;
  }

  @Get(":id/classes")
  async getClassesByCentreId(
    @Param("id") id: string,
  ): Promise<ClassEntityDto[]> {
    const isUuid = Uuid.test(id);
    if (!isUuid) throw new NotFoundException();
    const classes = await this.centresService.getClassesByCentreId(id);
    return plainToInstance(ClassEntityDto, classes);
  }

  @Post()
  async create(@Body() body: string[]): Promise<CentreEntityDto[]> {
    const entities = await this.centresService.createMany(body);
    return CentreEntityDto.fromMany(entities);
  }

  @Put(":id")
  async updateById(
    @Param("id") id: string,
    @Body() body: UpdateCentreDto,
  ): Promise<Centre> {
    const entity = await this.centresService.updateById(id, body.name);
    return entity;
  }

  @Delete(":id")
  async deleteById(@Param("id") id: string): Promise<Centre> {
    const entity = await this.centresService.deleteById(id);
    return entity;
  }
}
