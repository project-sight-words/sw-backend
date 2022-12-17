import { DatabaseService } from "database/database.service";
import { RolesRepository } from "./roles.repository";
import { Test, TestingModule } from "@nestjs/testing";

describe("RolesRepository", () => {
  let service: RolesRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesRepository, DatabaseService],
    }).compile();

    service = module.get<RolesRepository>(RolesRepository);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
