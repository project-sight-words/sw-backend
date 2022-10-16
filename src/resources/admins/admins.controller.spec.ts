import { AdminsController } from "./admins.controller";
import { AdminsRepository } from "./admins.repository";
import { AdminsService } from "./admins.service";
import { DatabaseService } from "database/database.service";
import { Test, TestingModule } from "@nestjs/testing";
import { UsersRepository } from "resources/users/users.repository";

describe("AdminsController", () => {
  let adminsController: AdminsController;

  beforeEach(async () => {
    const admins: TestingModule = await Test.createTestingModule({
      controllers: [AdminsController],
      providers: [
        AdminsRepository,
        AdminsService,
        DatabaseService,
        UsersRepository,
      ],
    }).compile();

    adminsController = admins.get<AdminsController>(AdminsController);
  });

  it("should be defined", () => {
    expect(adminsController).toBeDefined();
  });

  // TODO: Add tests for admins
});
