import { Test, TestingModule } from "@nestjs/testing";
import { DatabaseService } from "../../database/database.service";
import { UsersRepository } from "../users/users.repository";
import { AdminsRepository } from "./admins.repository";
import { AdminsService } from "./admins.service";

describe("AdminsService", () => {
  let adminsService: AdminsService;

  beforeEach(async () => {
    const admins: TestingModule = await Test.createTestingModule({
      providers: [
        AdminsService,
        AdminsRepository,
        UsersRepository,
        DatabaseService,
      ],
    }).compile();

    adminsService = admins.get<AdminsService>(AdminsService);
  });

  it("should be defined", () => {
    expect(adminsService).toBeDefined();
  });

  // TODO: Add tests for admins
});
