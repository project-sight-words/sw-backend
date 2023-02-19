import { Expose } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Timestamp,
} from "typeorm";
import { instanceToPlain, plainToInstance } from "utils/transformer";
import { CreateStamp, DeleteStamp, Identifier, UpdateStamp } from "./common";
import { User } from "./user.entities";

@Entity({ name: "students" })
export class Student {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "text" })
  studentId!: string;

  @Column({ type: "text" })
  name!: string;

  @Column({ type: "timestamptz", default: () => "NOW()" })
  updatedAt!: Date;

  @Column({ type: "uuid" })
  updatedBy: string | null = null;

  @OneToMany(() => StudentUser, (studentUser) => studentUser.studentId)
  studentUsers: StudentUser[] | null = null;
}

@Entity({ name: "student_users" })
export class StudentUser {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  userId!: string;

  @Column({ type: "uuid" })
  studentId!: string;

  @Column({ type: "timestamptz", default: () => "NOW()" })
  createdAt!: Date;

  @Column({ type: "uuid", nullable: true })
  createdBy: string | null = null;

  @Column({ type: "timestamptz", nullable: true })
  deletedAt: Date | null = null;

  @Column({ type: "uuid", nullable: true })
  deletedBy: string | null = null;

  @ManyToOne(() => Student, (student) => student.studentUsers)
  student!: Student;

  @ManyToOne(() => User, (user) => user.studentUsers)
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
