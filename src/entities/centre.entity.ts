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
  UpdateDateColumn,
} from "typeorm";
import { Class } from "./class.entity";

@Entity("centres")
export class Centre {
  @Expose()
  @PrimaryGeneratedColumn("uuid")
  @IsUUID()
  id!: string;

  @Expose()
  @Column({ name: "name", type: "varchar", nullable: false })
  @IsString()
  name!: string;

  @Exclude()
  @OneToMany(() => ClassCentre, (classCentre) => classCentre.centre)
  classCentres!: ClassCentre[];

  @Expose()
  @UpdateDateColumn({ name: "updated_at", default: new Date() })
  updatedAt!: Date;

  @Expose()
  @Column({ name: "updated_by", type: "uuid" })
  @IsUUID()
  updatedBy!: string;
}

@Entity("class_centres")
export class ClassCentre {
  @Expose()
  @PrimaryGeneratedColumn("uuid")
  @IsUUID()
  id!: string;

  @Expose()
  @Column({ name: "class_id", type: "uuid", nullable: false })
  @IsUUID()
  classId!: string;

  @Expose()
  @OneToOne(() => Class, (classEntity) => classEntity.classCentre)
  @JoinColumn({ name: "class_id" })
  class!: Class;

  @Expose()
  @Column({ name: "centre_id", type: "uuid", nullable: false })
  @IsUUID()
  centreId!: string;

  @Expose()
  @ManyToOne(() => Centre, (centreEntity) => centreEntity.classCentres)
  @JoinColumn({ name: "centre_id" })
  centre!: Centre;

  @Expose()
  @CreateDateColumn({ name: "created_at", default: new Date() })
  createdAt!: Date;

  @Expose()
  @Column({ name: "created_by", type: "uuid" })
  @IsUUID()
  createdBy!: string;

  @Expose()
  @DeleteDateColumn({ name: "deleted_at" })
  deletedAt!: Date | null;

  @Expose()
  @Column({ name: "deleted_by", type: "uuid" })
  @IsUUID()
  deletedBy!: string | null;
}
