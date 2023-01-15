import { Test, TestingModule } from "@nestjs/testing";
import { CentresRepository } from "./centres.repository";

describe("CentresRepository", () => {
  let repository: CentresRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CentresRepository],
    }).compile();

    repository = module.get<CentresRepository>(CentresRepository);
  });

  it("should be defined", () => {
    expect(repository).toBeDefined();
  });

  // TODO: Add tests for the rest of the methods
});
