import * as Joi from "joi";
import { AdminsModule } from "./resources/admins/admins.module";
import { AppController } from "app.controller";
import { AppService } from "app.service";
import { AuthenticationModule } from "resources/authentication/authentication.module";
import { ConfigModule } from "@nestjs/config";
import { Module } from "@nestjs/common";
import { StudentsModule } from "resources/students/students.module";
import { TeachersModule } from "resources/teachers/teachers.module";
import { UsersModule } from "resources/users/users.module";

const ConfigurationModule = ConfigModule.forRoot({
  cache: true,
  isGlobal: true,
  validationSchema: Joi.object({
    DB_HOST: Joi.string().default("sw-db"),
    DB_NAME: Joi.string().default("sw-db"),
    DB_PASSWORD: Joi.string().default("postgres"),
    DB_PORT: Joi.number().default(5432),
    DB_USER: Joi.string().default("postgres"),
    GOOGLE_OAUTH_CLIENT_ID: Joi.string().default(""),
    GOOGLE_OAUTH_CLIENT_SECRET: Joi.string().default(""),
    GOOGLE_OAUTH_FRONTEND_CLIENT_ID: Joi.string().default(""),
    JWT_EXPIRATION_SECONDS: Joi.number().default(300),
    JWT_SECRET: Joi.string().required(),
    PORT: Joi.number().default(3000),
    NODE_ENV: Joi.string().valid("development", "production").required(),
  }),
});

@Module({
  imports: [
    AdminsModule,
    AuthenticationModule,
    ConfigurationModule,
    TeachersModule,
    StudentsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AppModule {}
