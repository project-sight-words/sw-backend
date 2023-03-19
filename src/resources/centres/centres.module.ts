import { CentresController } from "./centres.controller";
import { CentresService } from "./centres.service";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Centre } from "entities/centre.entity";
import { Class } from "entities/class.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Centre, Class])],
  controllers: [CentresController],
  providers: [CentresService],
})
export class CentresModule {}
