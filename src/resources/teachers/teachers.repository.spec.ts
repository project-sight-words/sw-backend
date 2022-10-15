import { Test, TestingModule } from "@nestjs/testing";
import { TeachersRepository } from "./teachers.repository";
import { DatabaseService } from "../../database/database.service";

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
});
