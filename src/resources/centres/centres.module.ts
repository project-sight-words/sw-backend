import { CentresController } from "./centres.controller";
import { CentresRepository } from "./centres.repository";
import { CentresService } from "./centres.service";
import { Module } from "@nestjs/common";

@Module({
  controllers: [CentresController],
  providers: [CentresService, CentresRepository],
  exports: [CentresRepository],
})
export class CentresModule {}
