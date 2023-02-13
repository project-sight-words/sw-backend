import { Exclude, Expose } from "class-transformer";
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from "class-validator";
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
  @IsOptional()
  @IsUUID()
  @Expose()
  id!: string;

  @Column({ name: "start_day", type: "int", nullable: false })
  @IsInt()
  @Min(0)
  @Max(6)
  @IsNotEmpty()
  @Expose()
  startDay!: number;

  @Column({ name: "start_time", type: "time with time zone", nullable: false })
  @Expose()
  startTime!: string;

  @Column({ name: "end_day", type: "int", nullable: false })
  @Min(0)
  @Max(6)
  @IsNotEmpty()
  @Expose()
  endDay!: number;

  @Column({ name: "end_time", type: "time with time zone", nullable: false })
  @Expose()
  endTime!: string;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  @Column({ name: "updated_by", type: "uuid" })
  updatedBy!: string;

  @OneToMany(() => ClassStudent, (classStudent) => classStudent.class)
  @Exclude()
  classStudents!: ClassStudent[];

  @OneToMany(() => ClassTeacher, (classTeacher) => classTeacher.class)
  @Exclude()
  classTeachers!: ClassTeacher[];

  @OneToOne(() => ClassCentre, (classCentre) => classCentre.class)
  classCentre!: ClassCentre;

  @Expose()
  classes!: Class[];

  @Expose()
  students!: Student[];
}

@Entity("class_teachers")
export class ClassTeacher {
  @PrimaryGeneratedColumn("uuid")
  @IsUUID()
  @Expose()
  id!: string;

  @Column({ name: "class_id", type: "uuid", nullable: false })
  @IsUUID()
  @Expose()
  classId!: string;

  @OneToMany(() => Class, (classEntity) => classEntity.classTeachers)
  @JoinColumn({ name: "class_id" })
  @Expose()
  class!: Class;

  @Column({ name: "teacher_id", type: "uuid", nullable: false })
  @IsNotEmpty()
  @IsUUID()
  @Expose()
  teacherId!: string;

  @ManyToOne(() => Teacher, (teacher) => teacher.classTeachers)
  @JoinColumn({ name: "teacher_id" })
  @Expose()
  teacher!: Teacher;

  @Column({
    name: "is_form_teacher",
    type: "boolean",
    nullable: false,
    default: false,
  })
  @IsBoolean()
  @Expose()
  isFormTeacher!: boolean;

  @CreateDateColumn({ name: "created_at", default: new Date() })
  @Expose()
  createdAt!: Date;

  @Column({ name: "created_by", type: "uuid" })
  @Expose()
  @IsUUID()
  createdBy!: string;

  @DeleteDateColumn({ name: "deleted_at" })
  @Expose()
  deletedAt!: Date;

  @Column({ name: "deleted_by", type: "uuid" })
  @Expose()
  @IsUUID()
  deletedBy!: string;
}

@Entity("class_students")
export class ClassStudent {
  @PrimaryGeneratedColumn("uuid")
  @IsUUID()
  @Expose()
  id!: string;

  @Column({ name: "class_id", type: "uuid", nullable: false })
  @JoinColumn()
  @IsUUID()
  @Expose()
  classId!: string;

  @ManyToOne(() => Class, (classEntity) => classEntity.classStudents)
  @JoinColumn({ name: "class_id" })
  @Expose()
  class!: Class;

  @Column({ name: "student_id", type: "uuid", nullable: false })
  @JoinColumn()
  @IsUUID()
  @Expose()
  studentId!: string;

  @ManyToOne(() => Student)
  @JoinColumn({ name: "student_id" })
  @Expose()
  student!: Student;

  @CreateDateColumn({ name: "created_at", default: new Date() })
  @Expose()
  createdAt!: Date;

  @Column({ name: "created_by", type: "uuid" })
  @IsUUID()
  @Expose()
  createdBy!: string;

  @DeleteDateColumn({ name: "deleted_at" })
  @Expose()
  deletedAt!: Date;

  @Column({ name: "deleted_by", type: "uuid" })
  @IsUUID()
  @Expose()
  deletedBy!: string;

  // TODO: See if fromObject/toObject is needed
}
