import { DatabaseService } from "database/database.service";
import { TeachersRepository } from "./teachers.repository";
import { Test, TestingModule } from "@nestjs/testing";

describe("TeachersRepository", () => {
  let teachersRepository: TeachersRepository;

  beforeEach(async () => {
    const teachers: TestingModule = await Test.createTestingModule({
      providers: [TeachersRepository, DatabaseService],
    }).compile();

    teachersRepository = teachers.get<TeachersRepository>(TeachersRepository);
  });

  it("should be defined", () => {
    expect(teachersRepository).toBeDefined();
  });

  // TODO: add tests for teachers repository
});
