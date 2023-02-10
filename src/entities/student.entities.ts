import { Expose } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Timestamp,
  UpdateDateColumn,
} from "typeorm";
import { instanceToPlain, plainToInstance } from "utils/transformer";
import { CreateStamp, DeleteStamp, Identifier, UpdateStamp } from "./common";
import { User } from "./user.entities";

@Entity("students")
export class Student {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "student_id", type: "text" })
  studentId!: string;

  @Column({ type: "text" })
  name!: string;

  @UpdateDateColumn({ name: "updated_at", nullable: true })
  updatedAt: Date | null = null;

  @Column({ name: "updated_by", type: "uuid", nullable: true })
  updatedBy: string | null = null;

  @OneToMany(() => StudentUser, (studentUser) => studentUser.student)
  studentUsers: StudentUser[] | null = null;
}

@Entity("student_users")
export class StudentUser {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "user_id", type: "uuid" })
  userId!: string;

  @Column({ name: "student_id", type: "uuid" })
  studentId!: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @Column({ name: "created_by", type: "uuid", nullable: true })
  createdBy: string | null = null;

  @DeleteDateColumn({ name: "deleted_at", nullable: true })
  deletedAt: Date | null = null;

  @Column({ name: "deleted_by", type: "uuid", nullable: true })
  deletedBy: string | null = null;

  @ManyToOne(() => Student, (student) => student.studentUsers)
  @JoinColumn({ name: "student_id" })
  student!: Student;

  @ManyToOne(() => User, (user) => user.studentUsers)
  @JoinColumn({ name: "user_id" })
  user!: User;
}

export class StudentDatum {
  @Expose()
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @Expose({ name: "student_id" })
  @IsNotEmpty()
  @IsString()
  studentId!: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  name!: string;

  static fromObject(object: object): StudentDatum {
    const datum = plainToInstance(StudentDatum, object);
    return datum;
  }

  static toObject(datum: StudentDatum): object {
    const object = instanceToPlain(datum);
    return object;
  }
}

export class StudentEntity {
  identifier!: Identifier;
  datum!: StudentDatum;
  createStamp!: CreateStamp;
  updateStamp!: UpdateStamp;
  deleteStamp!: DeleteStamp;

  static fromObject(object: object): StudentEntity {
    const entity = new StudentEntity();
    entity.identifier = Identifier.fromObject(object);
    entity.datum = StudentDatum.fromObject(object);
    entity.createStamp = CreateStamp.fromObject(object);
    entity.updateStamp = UpdateStamp.fromObject(object);
    entity.deleteStamp = DeleteStamp.fromObject(object);
    return entity;
  }

  static toObject(entity: StudentEntity): object {
    const { identifier, datum, createStamp, updateStamp, deleteStamp } = entity;
    return {
      ...Identifier.toObject(identifier),
      ...StudentDatum.toObject(datum),
      ...CreateStamp.toObject(createStamp),
      ...UpdateStamp.toObject(updateStamp),
      ...DeleteStamp.toObject(deleteStamp),
    };
  }
}
