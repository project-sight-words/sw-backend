import { DatabaseService } from "database/database.service";
import { TeachersRepository } from "./teachers.repository";
import { TeachersService } from "./teachers.service";
import { Test, TestingModule } from "@nestjs/testing";
import { UsersRepository } from "resources/users/users.repository";

describe("TeachersService", () => {
  let teacherService: TeachersService;

  beforeEach(async () => {
    const teachers: TestingModule = await Test.createTestingModule({
      providers: [
        TeachersService,
        TeachersRepository,
        UsersRepository,
        DatabaseService,
      ],
    }).compile();

    teacherService = teachers.get<TeachersService>(TeachersService);
  });

  it("should be defined", () => {
    expect(teacherService).toBeDefined();
  });

  // TODO: Add tests for teachers
});
