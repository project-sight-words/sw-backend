import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { DatabaseModule } from "database/database.module";
import { UsersModule } from "resources/users/users.module";
import { AuthenticationController } from "./authentication.controller";
import { AuthenticationService } from "./authentication.service";
import { GoogleService } from "./google.service";
import { JwtStrategy } from "./jwt.strategy";
import { PermissionsGuard } from "./permissions.guard";
import { RolesRepository } from "./roles.repository";
import { SessionService } from "./session.service";

@Module({
  imports: [
    DatabaseModule,
    UsersModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.getOrThrow<string>("JWT_SECRET");
        return { secret };
      },
    }),
  ],
  providers: [
    GoogleService,
    AuthenticationService,
    RolesRepository,
    SessionService,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
  controllers: [AuthenticationController],
})
export class AuthenticationModule {}
