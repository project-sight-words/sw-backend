import { AuthenticationController } from "./authentication.controller";
import { AuthenticationService } from "./authentication.service";
import { ConfigService } from "@nestjs/config";
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
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.getOrThrow<string>("JWT_SECRET");
        const expirationSeconds = configService.getOrThrow<number>(
          "JWT_EXPIRATION_SECONDS",
        );
        return {
          secret,
          signOptions: {
            expiresIn: `${expirationSeconds}s`,
          },
        };
      },
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
