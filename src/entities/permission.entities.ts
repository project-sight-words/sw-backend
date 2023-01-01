import { Roles } from "./roles.entities";

export class Permission {
  constructor(readonly role: Roles, readonly isSelf: boolean = false) {}
}

export const Student = new Permission(Roles.student);
export const StudentSelf = new Permission(Roles.student, true);
export const Teacher = new Permission(Roles.teacher);
export const TeacherSelf = new Permission(Roles.teacher, true);
export const Admin = new Permission(Roles.admin);
export const AdminSelf = new Permission(Roles.admin, true);
