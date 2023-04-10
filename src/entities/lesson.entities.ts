import { IsDateString, IsNotEmpty, IsUUID } from "class-validator";
import { Class } from "./class.entities";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Expose } from "class-transformer";
import { LessonWord } from "./lessonWord.entities";

@Entity("lessons")
export class Lesson {
  @Expose()
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Expose()
  @Column({ name: "start_date", type: "timestamptz" })
  startDate!: Date;

  @Expose()
  @Column({ name: "end_date", type: "timestamptz" })
  endDate!: Date;

  @Expose()
  @Column({ name: "class_id", type: "uuid" })
  classId!: string;

  @Expose()
  @ManyToOne(() => Class, (c) => c.lessons)
  @JoinColumn({ name: "class_id" })
  class!: Class;

  @Expose()
  @OneToMany(() => LessonWord, (lessonWord) => lessonWord.lesson)
  lessonWords!: LessonWord[];

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
}

export class LessonDatum {
  @Expose({ name: "start_date" })
  @IsNotEmpty()
  @IsDateString()
  startDate!: Date;

  @Expose({ name: "end_date" })
  @IsNotEmpty()
  @IsDateString()
  endDate!: Date;

  @Expose({ name: "class_id" })
  @IsNotEmpty()
  @IsUUID()
  classId!: string;
}
