import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthenticationModule } from "./resources/authentication/authentication.module";
import { ConfigModule } from "@nestjs/config";
import { Module } from "@nestjs/common";
import { UsersModule } from "./resources/users/users.module";
import { TeachersModule } from "./resources/teachers/teachers.module";

@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthenticationModule,
    TeachersModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AppModule {}
