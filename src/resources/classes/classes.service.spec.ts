import { ClassesService } from "./classes.service";
import { Test, TestingModule } from "@nestjs/testing";

describe("ClassesService", () => {
  let service: ClassesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClassesService],
    }).compile();

    service = module.get<ClassesService>(ClassesService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  // TODO: Add tests for the rest of the methods
});
