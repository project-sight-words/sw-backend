import { Test, TestingModule } from "@nestjs/testing";
import { WordAttemptsService } from "./wordAttempts.service";

describe("WordAttemptsService", () => {
  let service: WordAttemptsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WordAttemptsService],
    }).compile();

    service = module.get<WordAttemptsService>(WordAttemptsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
