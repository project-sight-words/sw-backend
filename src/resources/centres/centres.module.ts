import { Module } from "@nestjs/common";
import { CentresService } from "./centres.service";
import { CentresController } from "./centres.controller";
import { CentresRepository } from "./centres.repository";

@Module({
  controllers: [CentresController],
  providers: [CentresService, CentresRepository],
})
export class CentresModule {}
