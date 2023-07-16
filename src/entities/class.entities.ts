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
  Relation,
  UpdateDateColumn,
} from "typeorm";
import { Centre } from "./centre.entities";
import { Student } from "./student.entities";
import { Teacher } from "./teacher.entities";
import { Lesson } from "./lesson.entities";

@Entity("classes")
export class Class {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "start_day", type: "int", nullable: false })
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

  @OneToOne(() => ClassCentre, (classCentre) => classCentre.class, {
    cascade: ["soft-remove"],
  })
  classCentre!: Relation<ClassCentre>;

  @OneToMany(() => Lesson, (lesson) => lesson.class)
  lessons!: Lesson[];

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;

  @DeleteDateColumn({ name: "deleted_at" })
  deletedAt!: Date | null;

  @Column({ name: "deleted_by", type: "uuid", nullable: true })
  deletedBy!: string | null;
}

@Entity("class_teachers")
export class ClassTeacher {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "class_id", type: "uuid", nullable: false })
  classId!: string;

  @ManyToOne(() => Class, (classEntity) => classEntity.classTeachers)
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
  deletedAt!: Date | null;

  @Column({ name: "deleted_by", type: "uuid" })
  deletedBy!: string | null;
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

  @ManyToOne(() => Student, (student) => student.classStudents)
  @JoinColumn({ name: "student_id" })
  student!: Student;

  @CreateDateColumn({ name: "created_at", default: new Date() })
  createdAt!: Date;

  @Column({ name: "created_by", type: "uuid" })
  createdBy!: string;

  @DeleteDateColumn({ name: "deleted_at" })
  deletedAt!: Date | null;

  @Column({ name: "deleted_by", type: "uuid" })
  deletedBy!: string | null;
}

@Entity("class_centres")
export class ClassCentre {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "class_id", type: "uuid", nullable: false })
  classId!: string;

  @OneToOne(() => Class, (classEntity) => classEntity.classCentre)
  @JoinColumn({ name: "class_id" })
  class!: Class;

  @Column({ name: "centre_id", type: "uuid", nullable: false })
  centreId!: string;

  @ManyToOne(() => Centre, (centreEntity) => centreEntity.classCentres)
  @JoinColumn({ name: "centre_id" })
  centre!: Centre;

  @CreateDateColumn({ name: "created_at", default: new Date() })
  createdAt!: Date;

  @Column({ name: "created_by", type: "uuid" })
  createdBy!: string;

  @DeleteDateColumn({ name: "deleted_at" })
  deletedAt!: Date | null;

  @Column({ name: "deleted_by", type: "uuid" })
  deletedBy!: string | null;
}
