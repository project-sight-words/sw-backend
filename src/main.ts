import * as cookieParser from "cookie-parser";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
// import { AllExceptionsFilter } from "ExceptionFilter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ["debug", "error", "log", "verbose", "warn"],
  });
  const configService = app.get(ConfigService);
  const port = configService.getOrThrow<number>("PORT");
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.enableCors();
  // TODO disable in production
  // app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(port);
}

void bootstrap();
