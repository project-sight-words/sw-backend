import { Exclude, Expose } from "class-transformer";
import { IsString, IsUUID } from "class-validator";
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
  @IsUUID()
  @Expose()
  id!: string;

  @Column({ name: "centre_name", type: "varchar", nullable: false })
  @IsString()
  @Expose()
  name!: string;

  @OneToMany(() => ClassCentre, (classCentre) => classCentre.centre)
  @Exclude()
  classCentres!: ClassCentre[];
}

@Entity("class_centres")
export class ClassCentre {
  @PrimaryGeneratedColumn("uuid")
  @IsUUID()
  @Expose()
  id!: string;

  @Column({ name: "centre_id", type: "uuid", nullable: false })
  @IsUUID()
  @Expose()
  classId!: string;

  @OneToOne(() => Class, (classEntity) => classEntity.classCentre)
  @JoinColumn({ name: "class_id" })
  @Expose()
  class!: Class;

  @Column({ name: "centre_id", type: "uuid", nullable: false })
  @IsUUID()
  @Expose()
  centreId!: string;

  @ManyToOne(() => Centre, (centreEntity) => centreEntity.classCentres)
  @JoinColumn({ name: "centre_id" })
  @Expose()
  centre!: Centre;

  @CreateDateColumn({ name: "created_at", default: new Date() })
  @Expose()
  createdAt!: Date;

  @Column({ name: "created_by", type: "uuid" })
  @IsUUID()
  @Expose()
  createdBy!: string;

  @DeleteDateColumn({ name: "deleted_at" })
  @Expose()
  deletedAt!: Date;

  @Column({ name: "deleted_by", type: "uuid" })
  @IsUUID()
  @Expose()
  deletedBy!: string;
}
