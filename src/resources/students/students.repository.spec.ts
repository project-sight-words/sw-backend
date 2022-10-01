import { Test, TestingModule } from "@nestjs/testing";
import { NewStudent, Student } from "../../entities/student.entities";
import { UsersRepository } from "../../resources/users/users.repository";
import { DatabaseService } from "../../database/database.service";
import { StudentsRepository } from "./students.repository";

// TODO: Setup mock database for yarn test
describe("StudentsRepository", () => {
  let service: StudentsRepository;
  const testNewStudent: NewStudent = {
    email: "user_student@example.com",
    studentId: "s15",
    name: "John Doe",
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DatabaseService, UsersRepository, StudentsRepository],
    }).compile();

    service = module.get<StudentsRepository>(StudentsRepository);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should return Student on upsertByEmailAndStudentId", async () => {
    // This should perform three INSERTs: to users, students, then user_students
    const insertedStudent = await service.upsertByEmailAndStudentId(
      testNewStudent,
    );
    expect(insertedStudent).toBeInstanceOf(Student);
    expect(insertedStudent.email).toBe(testNewStudent.email);
    expect(insertedStudent.studentId).toBe(testNewStudent.studentId);
    expect(insertedStudent.name).toBe(testNewStudent.name);
  });

  it("should return Student on getStudentById", async () => {
    const retrievedStudent = await service.getStudentById(
      testNewStudent.studentId,
    );
    expect(retrievedStudent.email).toBe(testNewStudent.email);
    expect(retrievedStudent.studentId).toBe(testNewStudent.studentId);
    expect(retrievedStudent.name).toBe(testNewStudent.name);
  });
});
