import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { LessonWord } from "./lessonWord.entities";

export type WordDifficulty = "Basic" | "Intermediate" | "Advanced";

@Entity("words")
@Unique(["word", "definition"])
export class Word {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "text" })
  word!: string;

  @Column({ type: "text" })
  definition!: string;

  @Column({ type: "text" })
  sentence!: string;

  @Column({
    type: "enum",
    enum: ["Basic", "Intermediate", "Advanced"],
    default: "Basic",
  })
  difficulty: WordDifficulty = "Basic";

  @Column({ type: "text", nullable: true })
  comment: string | null = null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @Column({ name: "created_by", type: "uuid", nullable: true })
  createdBy: string | null = null;

  @DeleteDateColumn({ name: "deleted_at", nullable: true })
  deletedAt: Date | null = null;

  @Column({ name: "deleted_by", type: "uuid", nullable: true })
  deletedBy: string | null = null;

  @OneToMany(() => Audio, (audio) => audio.word, {
    cascade: true,
    eager: true,
  })
  audios: Audio[] | null = null;

  @OneToMany(() => Image, (image) => image.word, {
    cascade: true,
    eager: true,
  })
  images: Image[] | null = null;

  @OneToMany(() => LessonWord, (lessonWord) => lessonWord.word)
  lessonWords: LessonWord[] | null = null;
}

@Entity("audios")
export class Audio {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "text" })
  link!: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @Column({ name: "created_by", type: "uuid", nullable: true })
  createdBy: string | null = null;

  @DeleteDateColumn({ name: "deleted_at", nullable: true })
  deletedAt: Date | null = null;

  @Column({ name: "deleted_by", type: "uuid", nullable: true })
  deletedBy: string | null = null;

  @Column({ name: "word_id", type: "uuid" })
  wordId!: string;

  @ManyToOne(() => Word, (word) => word.audios)
  @JoinColumn({ name: "word_id" })
  word!: Word;
}

@Entity("images")
export class Image {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "text" })
  link!: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @Column({ name: "created_by", type: "uuid", nullable: true })
  createdBy: string | null = null;

  @DeleteDateColumn({ name: "deleted_at", nullable: true })
  deletedAt: Date | null = null;

  @Column({ name: "deleted_by", type: "uuid", nullable: true })
  deletedBy: string | null = null;

  @Column({ name: "word_id", type: "uuid" })
  wordId!: string;

  @ManyToOne(() => Word, (word) => word.images)
  @JoinColumn({ name: "word_id" })
  word!: Word;
}
