import { DatabaseService } from "./database.service";
import { Test, TestingModule } from "@nestjs/testing";

describe("DatabaseService", () => {
  let service: DatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DatabaseService],
    }).compile();

    service = module.get<DatabaseService>(DatabaseService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should be able to query", async () => {
    const rows = await service.query("SELECT 1;");
    expect(rows.length).toBeGreaterThan(0);
    expect(typeof rows[0]).toBe("object");
    const row = rows[0] as Record<string, unknown>;
    const values = Object.values(row);
    expect(values.length).toBeGreaterThan(0);
    expect(values[0]).toBe(1);
  });

  afterAll(async () => {
    await service.onModuleDestroy();
  });
});
