import { SetMetadata } from "@nestjs/common";

export const TEACHER_SELF_KEY = "teacher_self";
export const TeacherSelf = () => SetMetadata(TEACHER_SELF_KEY, true);
