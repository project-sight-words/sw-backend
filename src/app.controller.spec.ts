import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import * as request from "supertest";

describe("AppController", () => {
  let appController: AppController;
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    app = module.createNestApplication();
    appController = module.get<AppController>(AppController);
    await app.init();
  });

  it("/health_check", () => {
    return request(app.getHttpServer())
      .get("/health_check")
      .expect(200)
      .expect("OK");
  });
});
