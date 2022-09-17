import { GoogleService } from "./google.service";
import { Test, TestingModule } from "@nestjs/testing";

describe("GoogleService", () => {
  let service: GoogleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GoogleService],
    }).compile();

    service = module.get<GoogleService>(GoogleService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  // TODO: Add tests for verifyIdToken
});
