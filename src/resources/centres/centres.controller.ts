import { AddClassToCentreDto } from "./dto/centres.dto";
import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { CentresService } from "./centres.service";

@Controller("centres")
export class CentresController {
  constructor(private readonly centresService: CentresService) {}

  @Get()
  async get() {
    const centres = await this.centresService.get();
    return centres;
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
