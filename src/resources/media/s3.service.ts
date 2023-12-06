import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Multer } from "multer";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class S3Service {
  private readonly s3: S3Client;
  private readonly bucketName: string;
  private readonly logger = new Logger("S3Service");

  constructor(private readonly configService: ConfigService) {
    const accessKey: string = configService.getOrThrow("S3_ACCESS_KEY");
    const keySecret: string = configService.getOrThrow("S3_KEY_SECRET");

    this.bucketName = configService.getOrThrow("S3_BUCKET");
    this.s3 = new S3Client({
      region: "ap-southeast-1",
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: keySecret,
      },
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<string | null> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const fileName = uuidv4();
    return await this.uploadToS3(
      file,
      this.bucketName,
      fileName,
      file.mimetype,
    );
  }

  private async uploadToS3(
    file: Express.Multer.File,
    bucket: string,
    name: string,
    mime: string,
  ): Promise<string | null> {
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
      await this.s3.send(new PutObjectCommand(params));
      return `https://${this.bucketName}.s3.amazonaws.com/${String(name)}`;
    } catch (e) {
      if (e instanceof Error)
        this.logger.warn(`Failed to upload file due to ${e.message}`);
      return null;
    }
  }
}
