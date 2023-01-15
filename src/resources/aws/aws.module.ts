import { Module } from "@nestjs/common";
import { S3Service } from "./s3.service";

@Module({
  exports: [S3Service],
})
export class AWSModule {}
