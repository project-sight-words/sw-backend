import { Test, TestingModule } from "@nestjs/testing";
import { WordAttemptsController } from "./wordAttempts.controller";
import { WordAttemptsService } from "./wordAttempts.service";

describe("WordAttemptsController", () => {
  let controller: WordAttemptsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WordAttemptsController],
      providers: [WordAttemptsService],
    }).compile();

    controller = module.get<WordAttemptsController>(WordAttemptsController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
