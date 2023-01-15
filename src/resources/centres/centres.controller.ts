import * as Uuid from "utils/uuid";
import { CentreDatumDto, CentreEntityDto } from "./dto/centres.dto";
import { CentresService } from "./centres.service";
import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
} from "@nestjs/common";

@Controller("centres")
export class CentresController {
  constructor(private readonly centresService: CentresService) {}

  @Get()
  async get(): Promise<CentreEntityDto[]> {
    const entities = await this.centresService.get();
    const dtos = entities.map((e) => CentreEntityDto.fromCentreEntity(e));
    return dtos;
  }

  @Get(":id")
  async getById(@Param("id") id: string): Promise<CentreEntityDto> {
    const isUuid = Uuid.test(id);
    if (!isUuid) throw new NotFoundException();
    const entities = await this.centresService.getById(id);
    if (entities.length === 0) throw new NotFoundException();
    const entity = entities[0];
    const dto = CentreEntityDto.fromCentreEntity(entity);
    return dto;
  }

  @Post()
  async create(@Body() body: CentreDatumDto): Promise<CentreEntityDto> {
    const datum = CentreDatumDto.toCentreDatum(body);
    const entity = await this.centresService.create(datum);
    const dto = CentreEntityDto.fromCentreEntity(entity);
    return dto;
  }

  @Put(":id")
  async updateById(
    @Param("id") id: string,
    @Body() body: CentreDatumDto,
  ): Promise<CentreEntityDto> {
    const isUuid = Uuid.test(id);
    if (!isUuid) throw new NotFoundException();
    const datum = CentreDatumDto.toCentreDatum(body);
    const entity = await this.centresService.updateById(id, datum);
    const dto = CentreEntityDto.fromCentreEntity(entity);
    return dto;
  }
}
