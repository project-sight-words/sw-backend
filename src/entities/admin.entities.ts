import { Expose } from "class-transformer";
import { IsEmail, IsNotEmpty } from "class-validator";
import { assert } from "console";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  ObjectLiteral,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { plainToInstance } from "utils/transformer";
import { User } from "./user.entities";

@Entity("admins")
export class Admin {
  @Expose()
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Expose()
  @OneToMany(() => AdminUser, (adminuser) => adminuser.admin)
  adminUsers: AdminUser[] | null = null;

  static from(src: ObjectLiteral[]): Admin[] {
    return plainToInstance(Admin, src);
  }
}

@Entity("admin_users")
export class AdminUser {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "user_id", type: "uuid" })
  userId!: string;

  @Column({ name: "admin_id", type: "uuid" })
  adminId!: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @Column({ name: "created_by", type: "uuid", nullable: true })
  createdBy: string | null = null;

  @DeleteDateColumn({ name: "deleted_at", nullable: true })
  deletedAt: Date | null = null;

  @Column({ name: "deleted_by", type: "uuid", nullable: true })
  deletedBy: string | null = null;

  @ManyToOne(() => Admin, (admin) => admin.adminUsers)
  @JoinColumn({ name: "admin_id" })
  admin!: Admin;

  @ManyToOne(() => User, (user) => user.adminUsers)
  @JoinColumn({ name: "user_id" })
  user!: User;

  static toCreateObjects(users: User[], admins: Admin[]): object[] {
    assert(users.length == admins.length);
    return users.map((u, i) => ({
      userId: u.id,
      adminId: admins[i].id,
    }));
  }
}

export class AdminDatum {
  @Expose()
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  static toCreateObjects(adminDatums: AdminDatum[]): object[] {
    return adminDatums.map(() => ({}));
  }
}
