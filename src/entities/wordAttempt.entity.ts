export enum ImageApprovalStatus {
  PENDING = "Pending",
  APPROVED = "Approved",
  REJECTED = "Rejected",
}

export enum Progress {
  LEARN = "Learn",
  PERSONALISATION = "Personalisation",
  RECALL = "Recall",
  QUIZ = "Quiz",
  COMPLETED = "Completed",
}

import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { LessonWord } from "./lessonWord.entities";
import { QuizAttempt } from "./quizAttempt.entity";
import { Student } from "./student.entities";

@Entity("word_attempts")
export class WordAttempt {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "lesson_word_id", type: "uuid", nullable: false })
  lessonWordId!: string;

  @ManyToOne(() => LessonWord, (lessonWord) => lessonWord.attempts)
  @JoinColumn({ name: "lesson_word_id" })
  lessonWord!: LessonWord;

  @Column({ name: "student_id", type: "uuid", nullable: false })
  studentId!: string;

  @ManyToOne(() => Student, (student) => student.wordAttempts)
  @JoinColumn({ name: "student_id" })
  student!: Student;

  @Column({ name: "attempted_at", type: "timestamptz", nullable: false })
  attemptedAt!: Date;

  @Column({
    name: "progress",
    type: "enum",
    enum: Progress,
    default: Progress.LEARN,
    nullable: false,
  })
  progress!: Progress;

  @Column({ name: "personalised_image_link", type: "text", nullable: true })
  personalisedImageLink!: string | null;

  @Column({
    name: "image_approval_status",
    type: "enum",
    enum: ImageApprovalStatus,
    default: ImageApprovalStatus.PENDING,
    nullable: false,
  })
  imageApprovalStatus!: ImageApprovalStatus;

  @OneToOne(() => QuizAttempt, (quizAttempt) => quizAttempt.wordAttempt)
  quizAttempt!: QuizAttempt;
}
