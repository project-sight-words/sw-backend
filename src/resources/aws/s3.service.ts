import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import AWS from "aws-sdk";

@Injectable()
export class S3Service {
  private readonly s3: AWS.S3;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    const accessKey: string = configService.getOrThrow("S3_ACCESS_KEY");
    const keySecret: string = configService.getOrThrow("S3_KEY_SECRET");

    this.bucketName = configService.getOrThrow("S3_BUCKET");
    this.s3 = new AWS.S3({
      accessKeyId: accessKey,
      secretAccessKey: keySecret,
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<boolean> {
    const { originalname } = file;
    return await this.uploadToS3(file, this.bucketName, originalname, file.mimetype);
  }

  private async uploadToS3(
    file: Express.Multer.File,
    bucket: string,
    name: string,
    mime: string,
  ): Promise<boolean> {
    const params = {
      Bucket: bucket,
      Key: String(name),
      Body: file.buffer,
      ContentType: mime,
      ContentDisposition: "inline",
      CreateBucketConfiguration: {
        LocationConstraint: "ap-southeast-1",
      },
    };

    try {
      const response = await this.s3.upload(params).promise();
      console.log(response);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
