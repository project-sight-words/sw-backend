import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";

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
  difficulty: "Basic" | "Intermediate" | "Advanced" = "Basic";

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

  @OneToMany(() => Audio, (audio) => audio.word)
  audios: Audio[] | null = null;

  @OneToMany(() => Image, (image) => image.word)
  images: Image[] | null = null;
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
  word!: Word;
}
