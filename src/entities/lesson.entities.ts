import { Class } from "./class.entities";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("lessons")
export class Lesson {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "start_date", type: "datetime" })
  startDate!: Date;

  @Column({ name: "end_date", type: "datetime" })
  endDate!: Date;

  @Column({ name: "class_id", type: "uuid" })
  classId!: string;

  @ManyToOne(() => Class, (c) => c.lessons)
  @JoinColumn({ name: "class_id" })
  class!: Class;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @Column({ name: "created_by", type: "uuid", nullable: true })
  createdBy: string | null = null;

  @DeleteDateColumn({ name: "deleted_at", nullable: true })
  deletedAt: Date | null = null;

  @Column({ name: "deleted_by", type: "uuid", nullable: true })
  deletedBy: string | null = null;
}
