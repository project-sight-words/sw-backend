import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Class } from "./class.entity";

@Entity("centres")
export class Centre {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "centre_name", type: "varchar", nullable: false })
  name!: string;

  @OneToMany(() => ClassCentre, (classCentre) => classCentre.centre)
  classCentres!: ClassCentre[];
}

@Entity("class_centres")
export class ClassCentre {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "centre_id", type: "uuid", nullable: false })
  classId!: string;

  @OneToOne(() => Class, (classEntity) => classEntity.classCentre)
  @JoinColumn({ name: "class_id" })
  class!: Class;

  @Column({ name: "centre_id", type: "uuid", nullable: false })
  centreId!: string;

  @ManyToOne(() => Centre, (centreEntity) => centreEntity.classCentres)
  @JoinColumn({ name: "centre_id" })
  centre!: Centre;

  @CreateDateColumn({ name: "created_at", default: new Date() })
  createdAt!: Date;

  @Column({ name: "created_by", type: "uuid" })
  createdBy!: string;

  @DeleteDateColumn({ name: "deleted_at" })
  deletedAt!: Date;

  @Column({ name: "deleted_by", type: "uuid" })
  deletedBy!: string;
}
