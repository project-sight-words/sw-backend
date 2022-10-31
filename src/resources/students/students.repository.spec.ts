import { DatabaseService } from "database/database.service";
import { NewStudent, Student } from "entities/student.entities";
import { StudentsRepository } from "./students.repository";
import { Test, TestingModule } from "@nestjs/testing";
import { UsersRepository } from "resources/users/users.repository";

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
    const insertedStudent = await service.upsertByEmailAndStudentId(
      testNewStudent,
    );
    expect(insertedStudent).toBeInstanceOf(Student);
    expect(insertedStudent.email).toBe(testNewStudent.email);
    expect(insertedStudent.studentId).toBe(testNewStudent.studentId);
    expect(insertedStudent.name).toBe(testNewStudent.name);
  });

  it("should return Student on getStudentById", async () => {
    const retrievedStudent = await service.getById(testNewStudent.studentId);
    expect(retrievedStudent).toBeInstanceOf(Student);
    expect(retrievedStudent.email).toBe(testNewStudent.email);
    expect(retrievedStudent.studentId).toBe(testNewStudent.studentId);
    expect(retrievedStudent.name).toBe(testNewStudent.name);
  });

  // TODO: The data should be preloaded using mocking to be safer
  it("should return Student on updateStudent", async () => {
    const testStudent = {
      email: "update_student@example.com",
      studentId: "S17",
      name: "Mary Jane",
    };
    await service.upsertByEmailAndStudentId(testStudent);

    const testUpdateStudent = {
      email: testStudent.email,
      studentId: testStudent.studentId,
      name: "Jerry Doe",
    };
    const updatedStudent = await service.updateStudent(testUpdateStudent);
    expect(updatedStudent).toBeDefined();
    expect(updatedStudent).toBeInstanceOf(Student);
    // Don't test for email as that is not returned with the UPDATE
    expect(updatedStudent.studentId).toBe(testUpdateStudent.studentId);
    expect(updatedStudent.name).toBe(testUpdateStudent.name);

    // TODO: Better mock this
    const failedUpdatedStudent = await service.updateStudent({
      email: "something@email.com",
      studentId: "123",
      name: "Jerry Doe",
    });
    expect(failedUpdatedStudent).toBeUndefined();
  });
});
