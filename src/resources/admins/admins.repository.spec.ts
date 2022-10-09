import { Test, TestingModule } from "@nestjs/testing";
import { AdminsRepository } from "./admins.repository";
import { AdminUser } from "../../entities/admin.entity";
import { DatabaseService } from "../../database/database.service";

describe("AdminsRepository", () => {
  let adminsRepository: AdminsRepository;

  beforeEach(async () => {
    const admins: TestingModule = await Test.createTestingModule({
      providers: [AdminsRepository, DatabaseService],
    }).compile();

    adminsRepository = admins.get<AdminsRepository>(AdminsRepository);
  });

  it("should be defined", () => {
    expect(adminsRepository).toBeDefined();
  });

  // TODO: Add tests for admins
  /*
  it("should return admin on create", async () => {
    const testUserId = "626fcbef-23e9-4e29-8e76-ebd6e864bd58";
    const testCreatedBy = "7d307658-13b2-402a-9f12-c37feebc1329";
    const createdAdmin = await adminsRepository.create(
      testUserId,
      testCreatedBy,
    );

    expect(createdAdmin).toBeInstanceOf(AdminUser);
    expect(createdAdmin.userId).toBe(testUserId);
    expect(createdAdmin.createdBy).toBe(testCreatedBy);
  });

  it("should return all admins on getAll", async () => {
    const testUserId = "626fcbef-23e9-4e29-8e76-ebd6e864bd58";
    const testCreatedBy = "7d307658-13b2-402a-9f12-c37feebc1329";
    await adminsRepository.create(testUserId, testCreatedBy);
    const allAdmins = await adminsRepository.getAll();

    expect(allAdmins[0]).toBeInstanceOf(AdminUser);
    expect(allAdmins[0].userId).toBe(testUserId);
    expect(allAdmins[0].createdBy).toBe(testCreatedBy);
  });

  it("should return an admin on getById", async () => {
    const testUserId = "626fcbef-23e9-4e29-8e76-ebd6e864bd58";
    const testCreatedBy = "7d307658-13b2-402a-9f12-c37feebc1329";
    const createdAdmin = await adminsRepository.create(
      testUserId,
      testCreatedBy,
    );
    const admin = await adminsRepository.getById(createdAdmin.adminId);

    expect(admin).toBeInstanceOf(AdminUser);
    expect(admin.userId).toBe(testUserId);
    expect(admin.createdBy).toBe(testCreatedBy);
  });

  it("should return a deleted admin on deleteById", async () => {
    const testUserId = "626fcbef-23e9-4e29-8e76-ebd6e864bd58";
    const testCreatedBy = "7d307658-13b2-402a-9f12-c37feebc1329";
    const testDeletedBy = "7d307658-13b2-402a-9f12-c37feebc1329";
    const createdAdmin = await adminsRepository.create(
      testUserId,
      testCreatedBy,
    );
    const deletedAdmin = await adminsRepository.deleteById(
      createdAdmin.adminId,
      testDeletedBy,
    );

    expect(deletedAdmin).toBeInstanceOf(AdminUser);
    expect(deletedAdmin.userId).toBe(testUserId);
    expect(deletedAdmin.createdBy).toBe(testCreatedBy);
    expect(deletedAdmin.deletedAt).toBeDefined();
    expect(deletedAdmin.deletedBy).toBe(testDeletedBy);
  });
  */
});
