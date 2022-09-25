// import { InternalServerErrorException } from "@nestjs/common";
// import { DatabaseService } from "src/database/database.service";
// import { Teacher } from "./teachers.model";

// export class TeachersRepository {
//   async insertTeacher(staff_id: string, name: string): Promise<void> {
//     const rows = await DatabaseService.query(
//       `
//       INSERT INTO teachers(staff_id, name)
//       VALUES (staff_id, name)
//       RETURNING *;
//       `,
//       [teacher.staff_id, teacher.name]
//     );
//     if (rows instanceof Error) throw new InternalServerErrorException();
//     if (rows.length !== 1) throw new InternalServerErrorException();
//     return ;//sth
//   }

//   async selectTeacher(id: number): Promise<Teacher> {
//     const rows = await DatabaseService.query(
//       `
//       SELECT id FROM teachers WHERE id=:id
//       RETURNING *
//       `
//       [teacher] //sth
//     );
//     if (rows instanceof Error) throw new InternalServerErrorException();
//     if (rows.length !== 1) throw new InternalServerErrorException();
//     return ;//sth
//   }
// }
