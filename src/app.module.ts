import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthenticationModule } from "./resources/authentication/authentication.module";
import { ConfigModule } from "@nestjs/config";
import { Module } from "@nestjs/common";
import { StudentsModule } from "./resources/students/students.module";
import { TeachersModule } from "./resources/teachers/teachers.module";
import { UsersModule } from "./resources/users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthenticationModule,
    TeachersModule,
    StudentsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AppModule {}
