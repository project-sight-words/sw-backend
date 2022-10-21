import { Controller, Get, Param, Post, Body, Delete } from "@nestjs/common";
import { CentresService } from "./centres.service";
import { AddClassToCentreDto } from "./dto/centres.dto";

@Controller("centres")
export class CentresController {
  constructor(private readonly centresService: CentresService) {}

  @Get()
  findAll() {
    return this.centresService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.centresService.findOne(id);
  }

  @Post(":id/classes")
  addClassToCentre(
    @Param("id") centreId: string,
    @Body() addClassToCentreDto: AddClassToCentreDto,
  ) {
    return this.centresService.addClassToCentre(
      centreId,
      addClassToCentreDto.classId,
    );
  }

  @Get(":id/classes")
  getClassesFromCentre(@Param("id") id: string) {
    return this.centresService.getClassesFromCentre(id);
  }

  @Delete(":id/classes/:classId")
  removeClassFromCentre(
    @Param("id") centreId: string,
    @Param("classId") classId: string,
  ) {
    return this.centresService.removeClassFromCentre(centreId, classId);
  }
}
