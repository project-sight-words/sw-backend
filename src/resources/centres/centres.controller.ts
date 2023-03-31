import * as Uuid from "utils/uuid";
import { CentresService } from "./centres.service";
import { Controller, Get, NotFoundException, Param } from "@nestjs/common";
import { Centre } from "entities/centre.entities";
import { plainToInstance } from "utils/transformer";
import { ClassEntityDto } from "resources/classes/dto/classes.dto";

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
