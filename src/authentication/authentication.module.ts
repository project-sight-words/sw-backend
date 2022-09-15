import { AuthenticationService } from "./authentication.service";
import { Module } from "@nestjs/common";

@Module({
  providers: [AuthenticationService],
})
export class AuthenticationModule {}
