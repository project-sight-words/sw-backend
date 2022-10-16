import { AdminsRepository } from "./admins.repository";
import { AdminsService } from "./admins.service";
import { DatabaseService } from "database/database.service";
import { Test, TestingModule } from "@nestjs/testing";
import { UsersRepository } from "resources/users/users.repository";

describe("AdminsService", () => {
  let adminsService: AdminsService;

  beforeEach(async () => {
    const admins: TestingModule = await Test.createTestingModule({
      providers: [
        AdminsRepository,
        AdminsService,
        DatabaseService,
        UsersRepository,
      ],
    }).compile();

    adminsService = admins.get<AdminsService>(AdminsService);
  });

  it("should be defined", () => {
    expect(adminsService).toBeDefined();
  });

  // TODO: Add tests for admins
});
