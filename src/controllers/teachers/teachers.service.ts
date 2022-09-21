import { Injectable } from "@nestjs/common";

import { Teacher } from "./teachers.model";

@Injectable()
export class TeachersService {
  createTeacher(staff_id: string, name: string): void {
    // returns nothing
    // return insertTeacher(staff_id, name);
  }

  getTeachers(): string {
    // return an array of teacher object
    // return selectAllTeachers();
    return "Get all teachers";
  }

  getTeacher(id: number): string {
    // return a teacher object
    // return selectTeacher(id);
    return "Get Single Teacher";
  }

  updateTeacher(id: number, staff_id: string, name: string): void {
    //dunnid return anyth
    // return changeTeacher(id);
  }

  deleteTeacher(id: number): void {
    //dunnid return anything
    // return removeTeacher( id);
  }
}
