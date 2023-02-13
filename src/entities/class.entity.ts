import { IsOptional } from "class-validator";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ClassCentre } from "./centre.entity";
import { Student } from "./student.entities";
import { Teacher } from "./teacher.entities";

@Entity("classes")
export class Class {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "start_day", type: "int", nullable: false })
  @IsOptional()
  startDay!: number;

  @Column({ name: "start_time", type: "time with time zone", nullable: false })
  startTime!: string;

  @Column({ name: "end_day", type: "int", nullable: false })
  endDay!: number;

  @Column({ name: "end_time", type: "time with time zone", nullable: false })
  endTime!: string;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  @Column({ name: "updated_by", type: "uuid" })
  updatedBy!: string;

  @OneToMany(() => ClassStudent, (classStudent) => classStudent.class)
  classStudents!: ClassStudent[];

  @OneToMany(() => ClassTeacher, (classTeacher) => classTeacher.class)
  classTeachers!: ClassTeacher[];

  @OneToOne(() => ClassCentre, (classCentre) => classCentre.class)
  classCentre!: ClassCentre;

  classes!: Class[];

  students!: Student[];
}

@Entity("class_teachers")
export class ClassTeacher {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "class_id", type: "uuid", nullable: false })
  classId!: string;

  @OneToMany(() => Class, (classEntity) => classEntity.classTeachers)
  @JoinColumn({ name: "class_id" })
  class!: Class;

  @Column({ name: "teacher_id", type: "uuid", nullable: false })
  teacherId!: string;

  @ManyToOne(() => Teacher, (teacher) => teacher.classTeachers)
  @JoinColumn({ name: "teacher_id" })
  teacher!: Teacher;

  @Column({
    name: "is_form_teacher",
    type: "boolean",
    nullable: false,
    default: false,
  })
  isFormTeacher!: boolean;

  @CreateDateColumn({ name: "created_at", default: new Date() })
  createdAt!: Date;

  @Column({ name: "created_by", type: "uuid" })
  createdBy!: string;

  @DeleteDateColumn({ name: "deleted_at" })
  deletedAt!: Date;

  @Column({ name: "deleted_by", type: "uuid" })
  deletedBy!: string;
}

@Entity("class_students")
export class ClassStudent {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "class_id", type: "uuid", nullable: false })
  @JoinColumn()
  classId!: string;

  @ManyToOne(() => Class, (classEntity) => classEntity.classStudents)
  @JoinColumn({ name: "class_id" })
  class!: Class;

  @Column({ name: "student_id", type: "uuid", nullable: false })
  @JoinColumn()
  studentId!: string;

  @ManyToOne(() => Student)
  @JoinColumn({ name: "student_id" })
  student!: Student;

  @CreateDateColumn({ name: "created_at", default: new Date() })
  createdAt!: Date;

  @Column({ name: "created_by", type: "uuid" })
  createdBy!: string;

  @Column({ name: "deleted_by", type: "uuid" })
  deletedBy!: string;

  // TODO: See if fromObject/toObject is needed
}
