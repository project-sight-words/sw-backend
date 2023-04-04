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
import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { Expose } from "class-transformer";
import { User } from "./user.entities";
import { ClassTeacher } from "./class.entities";
import { instanceToPlain, plainToInstance } from "utils/transformer";

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

  @OneToMany(() => ClassTeacher, (classTeacher) => classTeacher.teacher)
  classTeachers!: ClassTeacher[];
}

@Entity("teacher_users")
export class TeacherUser {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "user_id", type: "uuid" })
  userId!: string;

  @Column({ name: "teacher_id", type: "uuid" })
  teacherId!: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @Column({ name: "created_by", type: "uuid", nullable: true })
  createdBy: string | null = null;

  @DeleteDateColumn({ name: "deleted_at", nullable: true })
  deletedAt: Date | null = null;

  @Column({ name: "deleted_by", type: "uuid", nullable: true })
  deletedBy: string | null = null;

  @ManyToOne(() => Teacher, (teacher) => teacher.teacherUsers)
  @JoinColumn({ name: "teacher_id" })
  teacher!: Teacher;

  @ManyToOne(() => User, (user) => user.teacherUsers)
  @JoinColumn({ name: "user_id" })
  user!: User;
}

export class TeacherDatum {
  @Expose()
  @IsNotEmpty()
  @IsString()
  name!: string;

  @Expose({ name: "staff_id" })
  @IsNotEmpty()
  @IsString()
  staffId!: string;

  @Expose()
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  static toCreateObjects(teacherDatums: TeacherDatum[]): object[] {
    return teacherDatums.map((teacherDatum) => ({
      name: teacherDatum.name,
      staffId: teacherDatum.staffId,
    }));
  }

  // TODO: Remove if not used
  static fromObject(object: object): TeacherDatum {
    const datum = plainToInstance(TeacherDatum, object);
    return datum;
  }

  static toObject(datum: TeacherDatum): object {
    const object = instanceToPlain(datum);
    return object;
  }
}

// TODO: Remove if not used
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
