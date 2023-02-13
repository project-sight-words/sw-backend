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
} from "@nestjs/common";
import { Centre } from "entities/centre.entity";
import { CreateClassCentreDto } from "./dto/centres.dto";
import { Class } from "entities/class.entity";

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

  @Post(":id/classes")
  async addClassToCentre(
    @Param("id") id: string,
    @Body() classCentreDto: CreateClassCentreDto,
  ): Promise<void> {
    const isUuid = Uuid.test(id);
    if (!isUuid) throw new NotFoundException();
    const { classId } = classCentreDto;
    const isClassUuid = Uuid.test(classId);
    if (!isClassUuid) throw new NotFoundException();
    await this.centresService.addClassToCentre(id, classId);
  }

  @Delete(":id/classes/:classId")
  async removeClassFromCentre(
    @Param("id") id: string,
    @Param("classId") classId: string,
  ): Promise<void> {
    const isUuid = Uuid.test(id);
    if (!isUuid) throw new NotFoundException();
    const isClassUuid = Uuid.test(classId);
    if (!isClassUuid) throw new NotFoundException();

    await this.centresService.removeClassFromCentre(id, classId);
  }

  @Get(":id/classes")
  async getClassesByCentreId(@Param("id") id: string): Promise<Class[]> {
    const isUuid = Uuid.test(id);
    if (!isUuid) throw new NotFoundException();
    const classes = await this.centresService.getClassesByCentreId(id);
    return classes;
  }

  // CUD not supported
  // @Post()
  // async create(@Body() body: CentreDatumDto): Promise<Centre> {
  //   const datum = CentreDatumDto.toCentreDatum(body);
  //   const entity = await this.centresService.create(datum);
  //   const dto = CentreEntityDto.fromCentreEntity(entity);
  //   return dto;
  // }

  // @Put(":id")
  // async updateById(
  //   @Param("id") id: string,
  //   @Body() body: CentreDatumDto,
  // ): Promise<CentreEntityDto> {
  //   const isUuid = Uuid.test(id);
  //   if (!isUuid) throw new NotFoundException();
  //   const datum = CentreDatumDto.toCentreDatum(body);
  //   const entity = await this.centresService.updateById(id, datum);
  //   const dto = CentreEntityDto.fromCentreEntity(entity);
  //   return dto;
  // }
}
