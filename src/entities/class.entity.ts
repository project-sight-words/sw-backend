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
import { IsTimeWithTimezone } from "utils/validator";
import { ClassCentre } from "./centre.entity";
import { Student } from "./student.entities";
import { Teacher } from "./teacher.entities";

@Entity("classes")
export class Class {
  @Expose()
  @PrimaryGeneratedColumn("uuid")
  @IsOptional()
  @IsUUID()
  id!: string;

  @Expose()
  @Column({ name: "start_day", type: "int", nullable: false })
  @IsInt()
  @Min(0)
  @Max(6)
  @IsNotEmpty()
  startDay!: number;

  @Expose()
  @Column({ name: "start_time", type: "time with time zone", nullable: false })
  @IsTimeWithTimezone()
  startTime!: string;

  @Expose()
  @Column({ name: "end_day", type: "int", nullable: false })
  @Min(0)
  @Max(6)
  @IsNotEmpty()
  endDay!: number;

  @Expose()
  @Column({ name: "end_time", type: "time with time zone", nullable: false })
  @IsTimeWithTimezone()
  endTime!: string;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  @Column({ name: "updated_by", type: "uuid" })
  updatedBy!: string;

  @Exclude()
  @OneToMany(() => ClassStudent, (classStudent) => classStudent.class)
  classStudents!: ClassStudent[];

  @Exclude()
  @OneToMany(() => ClassTeacher, (classTeacher) => classTeacher.class)
  classTeachers!: ClassTeacher[];

  @OneToOne(() => ClassCentre, (classCentre) => classCentre.class)
  classCentre!: ClassCentre;
}

@Entity("class_teachers")
export class ClassTeacher {
  @Expose()
  @PrimaryGeneratedColumn("uuid")
  @IsUUID()
  id!: string;

  @Expose()
  @Column({ name: "class_id", type: "uuid", nullable: false })
  @IsUUID()
  classId!: string;

  @Expose()
  @ManyToOne(() => Class, (classEntity) => classEntity.classTeachers)
  @JoinColumn({ name: "class_id" })
  class!: Class;

  @Expose()
  @Column({ name: "teacher_id", type: "uuid", nullable: false })
  @IsNotEmpty()
  @IsUUID()
  teacherId!: string;

  @Expose()
  @ManyToOne(() => Teacher, (teacher) => teacher.classTeachers)
  @JoinColumn({ name: "teacher_id" })
  teacher!: Teacher;

  @Expose()
  @Column({
    name: "is_form_teacher",
    type: "boolean",
    nullable: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isFormTeacher!: boolean;

  @Expose()
  @CreateDateColumn({ name: "created_at", default: new Date() })
  createdAt!: Date;

  @Expose()
  @Column({ name: "created_by", type: "uuid" })
  @IsUUID()
  createdBy!: string;

  @Expose()
  @DeleteDateColumn({ name: "deleted_at" })
  deletedAt!: Date | null;

  @Expose()
  @Column({ name: "deleted_by", type: "uuid" })
  @IsUUID()
  deletedBy!: string | null;
}

@Entity("class_students")
export class ClassStudent {
  @Expose()
  @PrimaryGeneratedColumn("uuid")
  @IsUUID()
  id!: string;

  @Expose()
  @Column({ name: "class_id", type: "uuid", nullable: false })
  @JoinColumn()
  @IsUUID()
  classId!: string;

  @Expose()
  @ManyToOne(() => Class, (classEntity) => classEntity.classStudents)
  @JoinColumn({ name: "class_id" })
  class!: Class;

  @Expose()
  @Column({ name: "student_id", type: "uuid", nullable: false })
  @JoinColumn()
  @IsUUID()
  studentId!: string;

  @Expose()
  @ManyToOne(() => Student)
  @JoinColumn({ name: "student_id" })
  student!: Student;

  @Expose()
  @CreateDateColumn({ name: "created_at", default: new Date() })
  createdAt!: Date;

  @Expose()
  @Column({ name: "created_by", type: "uuid" })
  @IsUUID()
  createdBy!: string;

  @Expose()
  @DeleteDateColumn({ name: "deleted_at" })
  deletedAt!: Date | null;

  @Expose()
  @Column({ name: "deleted_by", type: "uuid" })
  @IsUUID()
  deletedBy!: string | null;

  // TODO: See if fromObject/toObject is needed
}
