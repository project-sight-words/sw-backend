import { CentresController } from "./centres.controller";
import { CentresService } from "./centres.service";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Centre } from "entities/centre.entities";
import { Class } from "entities/class.entities";

@Module({
  imports: [TypeOrmModule.forFeature([Centre, Class])],
  controllers: [CentresController],
  providers: [CentresService],
})
export class CentresModule {}
