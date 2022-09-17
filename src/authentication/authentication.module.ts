import { AuthenticationController } from "./authentication.controller";
import { GoogleService } from "./google.service";
import { Module } from "@nestjs/common";

@Module({
  providers: [GoogleService],
  controllers: [AuthenticationController],
})
export class AuthenticationModule {}
