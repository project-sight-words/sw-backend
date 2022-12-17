import { DatabaseService } from "../../database/database.service";
import { NewUser, User } from "../../entities/user.entities";
import { Test, TestingModule } from "@nestjs/testing";
import { UsersRepository } from "./users.repository";

describe("UsersRepository", () => {
  let service: UsersRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersRepository, DatabaseService],
    }).compile();

    service = module.get<UsersRepository>(UsersRepository);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should return user on upsertByEmail", async () => {
    const testNewUser: NewUser = {
      email: "user@example.com",
      lastLoggedIn: null,
    };
    const insertedUser = await service.upsertByEmail(testNewUser);
    expect(insertedUser).toBeInstanceOf(User);
    expect(insertedUser.email).toBe(testNewUser.email);
    expect(insertedUser.lastLoggedIn).toBe(testNewUser.lastLoggedIn);
    const currentTimestamp = new Date();
    const updatedUser = await service.upsertByEmail({
      email: testNewUser.email,
      lastLoggedIn: currentTimestamp,
    });
    expect(updatedUser).toBeInstanceOf(User);
    expect(updatedUser.email).toBe(testNewUser.email);
    expect(updatedUser.lastLoggedIn).toEqual(currentTimestamp);
    expect(updatedUser.id).toBe(insertedUser.id);
  });
});
