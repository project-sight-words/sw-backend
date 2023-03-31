import { IsDate, IsNotEmpty, IsUUID } from "class-validator";
import { Class } from "./class.entities";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  ObjectLiteral,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Expose } from "class-transformer";
import { plainToInstance } from "utils/transformer";

@Entity("lessons")
export class Lesson {
  @Expose()
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Expose()
  @Column({ name: "start_date", type: "datetime" })
  startDate!: Date;

  @Expose()
  @Column({ name: "end_date", type: "datetime" })
  endDate!: Date;

  @Expose()
  @Column({ name: "class_id", type: "uuid" })
  classId!: string;

  @Expose()
  @ManyToOne(() => Class, (c) => c.lessons)
  @JoinColumn({ name: "class_id" })
  class!: Class;

  @Expose()
  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @Expose()
  @Column({ name: "created_by", type: "uuid", nullable: true })
  createdBy: string | null = null;

  @Expose()
  @DeleteDateColumn({ name: "deleted_at", nullable: true })
  deletedAt: Date | null = null;

  @Expose()
  @Column({ name: "deleted_by", type: "uuid", nullable: true })
  deletedBy: string | null = null;

  static from(src: ObjectLiteral[]): Lesson[] {
    return plainToInstance(Lesson, src);
  }
}

export class LessonDatum {
  @Expose()
  @IsNotEmpty()
  @IsDate()
  startDate!: Date;

  @Expose()
  @IsNotEmpty()
  @IsDate()
  endDate!: Date;

  @Expose()
  @IsNotEmpty()
  @IsUUID()
  classId!: string;
}
