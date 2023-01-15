import { Controller, HttpCode, InternalServerErrorException, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { S3Service } from "./s3.service";

@Controller("aws")
export class AWSController {
  constructor(private readonly s3Service: S3Service) { }

  @Post('upload')
  @HttpCode(204)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const status = await this.s3Service.uploadFile(file)
    if (!status) throw new InternalServerErrorException()
  }
}