import { SessionService } from "./session.service";
import { Test, TestingModule } from "@nestjs/testing";

describe("SessionService", () => {
  let service: SessionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SessionService],
    }).compile();

    service = module.get<SessionService>(SessionService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
