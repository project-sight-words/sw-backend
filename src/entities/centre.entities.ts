import {
  Column,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ClassCentre } from "./class.entities";

@Entity("centres")
export class Centre {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "name", type: "varchar", nullable: false })
  name!: string;

  @OneToMany(() => ClassCentre, (classCentre) => classCentre.centre, {
    cascade: ["soft-remove"],
  })
  classCentres!: ClassCentre[];

  @UpdateDateColumn({ name: "updated_at", default: new Date() })
  updatedAt!: Date;

  @Column({ name: "updated_by", type: "uuid" })
  updatedBy!: string;

  @DeleteDateColumn({ name: "deleted_at" })
  deletedAt!: Date | null;

  @Column({ name: "deleted_by", type: "uuid", nullable: true })
  deletedBy!: string | null;
}
