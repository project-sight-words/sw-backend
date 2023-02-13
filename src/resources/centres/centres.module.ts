import { CentresController } from "./centres.controller";
import { CentresRepository } from "./centres.repository";
import { CentresService } from "./centres.service";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Centre, ClassCentre } from "entities/centre.entity";
import { ClassesRepository } from "resources/classes/classes.repository";

@Module({
  imports: [TypeOrmModule.forFeature([Centre, ClassCentre])],
  controllers: [CentresController],
  providers: [CentresService, CentresRepository, ClassesRepository],
})
export class CentresModule {}
