import {
  Check,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { WordAttempt } from "./wordAttempt.entity";

@Entity("quiz_attempts")
export class QuizAttempt {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "attempted_at", type: "timestamptz", nullable: true })
  attemptedAt!: Date | null;

  @Column({
    name: "score_one_total",
    type: "integer",
    default: 1,
    nullable: false,
  })
  @Check("score_one_total >= 0")
  scoreOneTotal!: number;

  @Column({
    name: "score_two_total",
    type: "integer",
    default: 1,
    nullable: false,
  })
  @Check("score_two_total >= 0")
  scoreTwoTotal!: number;

  @Column({ name: "score_one", type: "integer", nullable: true })
  @Check("score_one >= 0")
  scoreOne!: number | null;

  @Column({ name: "score_two", type: "integer", nullable: true })
  @Check("score_two >= 0")
  scoreTwo!: number | null;

  @Column({ name: "unsubmitted_at", type: "timestamptz", nullable: true })
  unsubmittedAt!: Date | null;

  @Column({ name: "unsubmitted_by", type: "uuid", nullable: true })
  unsubmittedBy!: string | null;

  @Column({ name: "word_attempt_id", type: "uuid", nullable: false })
  wordAttemptId!: string;

  @OneToOne(() => WordAttempt, (wordAttempt) => wordAttempt.quizAttempt)
  @JoinColumn({ name: "word_attempt_id" })
  wordAttempt!: WordAttempt;
}
