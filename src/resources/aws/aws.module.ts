import { Module } from "@nestjs/common";
import { AWSController } from "./aws.controller";
import { S3Service } from "./s3.service";

@Module({
  controllers: [AWSController],
  exports: [S3Service],
  providers: [S3Service],
})
export class AWSModule {}
