import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthenticationModule } from "./resources/authentication/authentication.module";
import { ConfigModule } from "@nestjs/config";
import { Module } from "@nestjs/common";
import { UsersModule } from "./resources/users/users.module";
import { AdminsModule } from "./resources/admins/admins.module";

@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthenticationModule,
    UsersModule,
    AdminsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AppModule {}
