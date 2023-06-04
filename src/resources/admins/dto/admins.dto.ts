import { Expose } from "class-transformer";
import { IsNotEmpty, IsUUID } from "class-validator";
import { AdminDatum, AdminUser } from "entities/admin.entities";

export class CreateAdminDto extends AdminDatum {}

export class AdminDto extends AdminDatum {
  @Expose()
  @IsNotEmpty()
  @IsUUID()
  id!: string;

  static fromAdminUser(adminUser: AdminUser): AdminDto {
    return {
      id: adminUser.adminId,
      email: adminUser.user.email,
    };
  }

  static fromAdminUsers(adminUsers: AdminUser[]): AdminDto[] {
    return adminUsers.map((adminUser) => AdminDto.fromAdminUser(adminUser));
  }
}
