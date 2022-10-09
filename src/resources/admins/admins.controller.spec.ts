import { Test, TestingModule } from "@nestjs/testing";
import { DatabaseService } from "../../database/database.service";
import { UsersRepository } from "../users/users.repository";
import { AdminsController } from "./admins.controller";
import { AdminsRepository } from "./admins.repository";
import { AdminsService } from "./admins.service";

describe("AdminsController", () => {
  let adminsController: AdminsController;

  beforeEach(async () => {
    const admins: TestingModule = await Test.createTestingModule({
      controllers: [AdminsController],
      providers: [
        AdminsService,
        AdminsRepository,
        UsersRepository,
        DatabaseService,
      ],
    }).compile();

    adminsController = admins.get<AdminsController>(AdminsController);
  });

  it("should be defined", () => {
    expect(adminsController).toBeDefined();
  });

  // TODO: Add tests for admins
});
