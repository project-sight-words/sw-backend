import { DatabaseService } from "database/database.service";
import { TeachersController } from "./teachers.controller";
import { TeachersRepository } from "./teachers.repository";
import { TeachersService } from "./teachers.service";
import { Test, TestingModule } from "@nestjs/testing";
import { UsersRepository } from "resources/users/users.repository";

describe("TeachersController", () => {
  let teachersController: TeachersController;

  beforeEach(async () => {
    const teachers: TestingModule = await Test.createTestingModule({
      controllers: [TeachersController],
      providers: [
        TeachersService,
        TeachersRepository,
        UsersRepository,
        DatabaseService,
      ],
    }).compile();

    teachersController = teachers.get<TeachersController>(TeachersController);
  });

  it("should be defined", () => {
    expect(teachersController).toBeDefined();
  });

  // TODO: add tests for teachers controller
});
