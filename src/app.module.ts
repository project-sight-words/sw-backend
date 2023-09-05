import { AdminsModule } from "resources/admins/admins.module";
import { AppController } from "app.controller";
import { AppService } from "app.service";
import * as Joi from "joi";
import { AuthenticationModule } from "resources/authentication/authentication.module";
import { CentresModule } from "resources/centres/centres.module";
import { ClassesModule } from "resources/classes/classes.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { DatabaseModule } from "database/database.module";
import { LessonsModule } from "resources/lessons/lessons.module";
import { LessonWordsModule } from "resources/lessonWords/lessonWords.module";
import { MediaModule } from "resources/media/media.module";
import { Module } from "@nestjs/common";
import { StudentsModule } from "resources/students/students.module";
import { TeachersModule } from "resources/teachers/teachers.module";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";
import { UsersModule } from "resources/users/users.module";
import { WordsModule } from "resources/words/words.module";
import { WordAttemptsModule } from "resources/wordAttempts/wordAttempts.module";
import { QuizAttemptsModule } from "resources/quizAttempts/quizAttempts.module";
import { APP_FILTER } from "@nestjs/core";
import { AllExceptionsFilter } from "utils/AllExceptionsFilter";

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
    JWT_REFRESH_EXPIRATION_SECONDS: Joi.number().default(3600),
    JWT_SECRET: Joi.string().required(),
    PORT: Joi.number().default(3000),
    NODE_ENV: Joi.string().valid("development", "production").required(),
    S3_ACCESS_KEY: Joi.string().required(),
    S3_KEY_SECRET: Joi.string().required(),
    S3_BUCKET: Joi.string().required(),
    IS_HEROKU: Joi.boolean().default(false),
    DATABASE_URL: Joi.string().default(null),
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
    WordsModule,
    MediaModule,
    LessonsModule,
    LessonWordsModule,
    WordAttemptsModule,
    QuizAttemptsModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        if (!configService.getOrThrow<boolean>("IS_HEROKU"))
          return {
            type: "postgres" as const,
            host: configService.getOrThrow<string>("DB_HOST"),
            port: configService.getOrThrow<number>("DB_PORT"),
            username: configService.getOrThrow<string>("DB_USER"),
            password: configService.getOrThrow<string>("DB_PASSWORD"),
            database: configService.getOrThrow<string>("DB_NAME"),
            entities: [__dirname + "/entities/**/*.{js,ts}"],
            logging: true,
          } as TypeOrmModuleOptions;

        // When Heroku is in use, use the information from DATABASE_URL
        return {
          type: "postgres" as const,
          url: configService.getOrThrow<string>("DATABASE_URL"),
          ssl: true,
          extra: {
            ssl: {
              rejectUnauthorized: false,
            },
          },
          entities: [__dirname + "/entities/**/*.{js,ts}"],
          logging: true,
        } as TypeOrmModuleOptions;
      },
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
