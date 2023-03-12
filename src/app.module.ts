import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "app.controller";
import { AppService } from "app.service";
import * as Joi from "joi";
import { AuthenticationModule } from "resources/authentication/authentication.module";
import { CentresModule } from "resources/centres/centres.module";
import { ClassesModule } from "resources/classes/classes.module";
import { StudentsModule } from "resources/students/students.module";
import { TeachersModule } from "resources/teachers/teachers.module";
import { UsersModule } from "resources/users/users.module";
import { DatabaseModule } from "database/database.module";
import { AdminsModule } from "resources/admins/admins.module";

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
    CentresModule,
    ClassesModule,
    ConfigurationModule,
    TeachersModule,
    StudentsModule,
    UsersModule,
    DatabaseModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "postgres" as const,
        host: configService.getOrThrow<string>("DB_HOST"),
        port: configService.getOrThrow<number>("DB_PORT"),
        username: configService.getOrThrow<string>("DB_USER"),
        password: configService.getOrThrow<string>("DB_PASSWORD"),
        database: configService.getOrThrow<string>("DB_NAME"),
        entities: [__dirname + "/entities/**/*.{js,ts}"],
        logging: true,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
