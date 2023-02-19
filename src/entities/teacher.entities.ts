import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { CreateStamp, DeleteStamp, Identifier, UpdateStamp } from "./common";
import { IsEmail, IsNotEmpty, IsString, IsUUID } from "class-validator";
import { instanceToPlain, plainToInstance } from "utils/transformer";

import { Expose } from "class-transformer";
import { User } from "./user.entities";

@Entity("teachers")
export class Teacher {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "staff_id", type: "text" })
  staffId!: string;

  @Column({ type: "text" })
  name!: string;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  @Column({ name: "updated_by", type: "uuid", nullable: true })
  updatedBy: string | null = null;

  @OneToMany(() => TeacherUser, (teacherUser) => teacherUser.teacher)
  teacherUsers: TeacherUser[] | null = null;

  static fromTeacherUser(teacherUser: TeacherUser): Teacher {
    return teacherUser.teacher;
  }
}

@Entity("teacher_users")
export class TeacherUser {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Teacher, (teacher) => teacher.teacherUsers)
  @JoinColumn({ name: "teacher_id" })
  teacher!: Teacher;

  @ManyToOne(() => User, (user) => user.teacherUsers)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @Column({ name: "created_by", type: "uuid", nullable: true })
  createdBy: string | null = null;

  @DeleteDateColumn({ name: "deleted_at", nullable: true })
  deletedAt: Date | null = null;

  @Column({ name: "deleted_by", type: "uuid", nullable: true })
  deletedBy: string | null = null;
}

export class TeacherDatum {
  @Expose()
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @Expose({ name: "staff_id" })
  @IsNotEmpty()
  @IsString()
  staffId!: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  name!: string;

  static fromObject(object: object): TeacherDatum {
    const datum = plainToInstance(TeacherDatum, object);
    return datum;
  }

  static toObject(datum: TeacherDatum): object {
    const object = instanceToPlain(datum);
    return object;
  }
}

export class TeacherEntity {
  identifier!: Identifier;
  datum!: TeacherDatum;
  createStamp!: CreateStamp;
  updateStamp!: UpdateStamp;
  deleteStamp!: DeleteStamp;

  static fromObject(object: object): TeacherEntity {
    const entity = new TeacherEntity();
    entity.identifier = Identifier.fromObject(object);
    entity.datum = TeacherDatum.fromObject(object);
    entity.createStamp = CreateStamp.fromObject(object);
    entity.updateStamp = UpdateStamp.fromObject(object);
    entity.deleteStamp = DeleteStamp.fromObject(object);
    return entity;
  }

  static toObject(entity: TeacherEntity): object {
    const { identifier, datum, createStamp, updateStamp, deleteStamp } = entity;
    return {
      ...Identifier.toObject(identifier),
      ...TeacherDatum.toObject(datum),
      ...CreateStamp.toObject(createStamp),
      ...UpdateStamp.toObject(updateStamp),
      ...DeleteStamp.toObject(deleteStamp),
    };
  }
}

export class UpdateTeacher {
  @Expose({ name: "staff_id" })
  @IsNotEmpty()
  @IsString()
  staffId!: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  name!: string;
}

export class NewTeacher extends UpdateTeacher {
  @Expose()
  @IsNotEmpty()
  @IsEmail()
  email!: string;
}

export class NewTeacherUser {
  @Expose({ name: "user_id" })
  @IsNotEmpty()
  @IsUUID()
  userId!: string;

  @Expose({ name: "teacher_id" })
  @IsNotEmpty()
  @IsUUID()
  teacherId!: string;
}
