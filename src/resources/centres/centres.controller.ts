import * as Uuid from "utils/uuid";
import { CentreDto, IdentifiableCentreDto } from "./dto/centres.dto";
import { CentreEntity } from "entities/centre.entity";
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
  async get(): Promise<IdentifiableCentreDto[]> {
    const entities: CentreEntity[] = await this.centresService.get();
    const dtos = entities.map((e) => IdentifiableCentreDto.fromEntity(e));
    return dtos;
  }

  @Get(":id")
  async getById(@Param("id") id: string): Promise<IdentifiableCentreDto> {
    const isUuid = Uuid.test(id);
    if (!isUuid) throw new NotFoundException();
    const entities: CentreEntity[] = await this.centresService.getById(id);
    if (entities.length === 0) throw new NotFoundException();
    const entity = entities[0];
    const dto = IdentifiableCentreDto.fromEntity(entity);
    return dto;
  }

  @Post()
  async create(@Body() body: CentreDto): Promise<IdentifiableCentreDto> {
    const centre = CentreDto.toCentre(body);
    const entity = await this.centresService.create(centre);
    const dto = IdentifiableCentreDto.fromEntity(entity);
    return dto;
  }

  @Put(":id")
  async updateById(
    @Param("id") id: string,
    @Body() body: CentreDto,
  ): Promise<IdentifiableCentreDto> {
    const isUuid = Uuid.test(id);
    if (!isUuid) throw new NotFoundException();
    const centre = CentreDto.toCentre(body);
    const entity = await this.centresService.updateById(id, centre);
    const dto = IdentifiableCentreDto.fromEntity(entity);
    return dto;
  }

  // @Post(":id/classes")
  // addClassToCentre(
  //   @Param("id") centreId: string,
  //   @Body() addClassToCentreDto: AddClassToCentreDto,
  // ) {
  //   return this.centresService.addClassToCentre(
  //     centreId,
  //     addClassToCentreDto.classId,
  //   );
  // }

  // @Get(":id/classes")
  // getClassesFromCentre(@Param("id") id: string) {
  //   return this.centresService.getClassesFromCentre(id);
  // }

  // @Delete(":id/classes/:classId")
  // removeClassFromCentre(
  //   @Param("id") centreId: string,
  //   @Param("classId") classId: string,
  // ) {
  //   return this.centresService.removeClassFromCentre(centreId, classId);
  // }
}
