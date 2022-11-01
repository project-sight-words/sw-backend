import { AuthenticationController } from "./authentication.controller";
import { AuthenticationService } from "./authentication.service";
import { DatabaseModule } from "database/database.module";
import { GoogleService } from "./google.service";
import { JwtModule } from "@nestjs/jwt";
import { Module } from "@nestjs/common";
import { RolesRepository } from "./roles.repository";
import { SessionService } from "./session.service";
import { UsersModule } from "resources/users/users.module";

@Module({
  imports: [
    DatabaseModule,
    UsersModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET ?? "",
        signOptions: {
          expiresIn: `${process.env.JWT_EXPIRATION_SECONDS ?? "300"}s`,
        },
      }),
    }),
  ],
  providers: [
    GoogleService,
    AuthenticationService,
    RolesRepository,
    SessionService,
  ],
  controllers: [AuthenticationController],
})
export class AuthenticationModule {}
