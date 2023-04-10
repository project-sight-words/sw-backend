import { IsNotEmpty, IsUUID } from "class-validator";
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
import { Lesson } from "./lesson.entities";
import { Word } from "./word.entities";
import { WordAttempt } from "./wordAttempt.entity";

@Entity("lesson_words")
export class LessonWord {
  @Expose()
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Expose()
  @Column({ name: "word_id", type: "uuid" })
  wordId!: string;

  @Expose()
  @Column({ name: "lesson_id", type: "uuid" })
  lessonId!: string;

  @Expose()
  @ManyToOne(() => Word, (word) => word.lessonWords)
  @JoinColumn({ name: "word_id" })
  word!: Word;

  @Expose()
  @ManyToOne(() => Lesson, (lesson) => lesson.lessonWords)
  @JoinColumn({ name: "lesson_id" })
  lesson!: Lesson;

  @Expose()
  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @OneToMany(() => WordAttempt, (wordAttempt) => wordAttempt.lessonWord)
  attempts!: WordAttempt[];

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

export class LessonWordDatum {
  @Expose({ name: "word_id" })
  @IsNotEmpty()
  @IsUUID()
  wordId!: string;

  @Expose({ name: "lesson_id" })
  @IsNotEmpty()
  @IsUUID()
  lessonId!: string;
}
