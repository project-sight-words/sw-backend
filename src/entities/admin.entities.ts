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
import { User } from "./user.entities";

@Entity("admins")
export class Admin {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @OneToMany(() => AdminUser, (adminuser) => adminuser.admin)
  adminUsers: AdminUser[] | null = null;

  static fromAdminUser(adminUser: AdminUser): Admin {
    return adminUser.admin;
  }
}

@Entity("admin_users")
export class AdminUser {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Admin, (admin) => admin.adminUsers)
  @JoinColumn({ name: "admin_id" })
  admin!: Admin;

  @ManyToOne(() => User, (user) => user.adminUsers)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @Column({ name: "created_by", type: "uuid", nullable: true })
  createdBy: string | null = null;

  @DeleteDateColumn({ name: "deleted_at", nullable: true })
  deletedAt: Date | null = null;

  @Column({ name: "deleted_by", type: "uuid", nullable: true })
  deletedBy: string | null = null;
}
