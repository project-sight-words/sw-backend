import { Admin, AdminUser } from "entities/admin.entities";
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UsersService } from "resources/users/users.service";

@Injectable()
export class AdminsService {
  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(AdminUser)
    private readonly adminUserRepository: Repository<AdminUser>,
  ) {}

  async get(): Promise<Admin[]> {
    const adminUsers = await this.adminUserRepository.find({
      relations: {
        user: true,
        admin: true,
      },
      withDeleted: false,
    });
    const admins = adminUsers.map((au) => Admin.fromAdminUser(au));
    return admins;
  }

  async findOneById(uuid: string): Promise<Admin | null> {
    const adminUser = await this.adminUserRepository.findOne({
      relations: {
        user: true,
        admin: true,
      },
      withDeleted: false,
      where: {
        admin: { id: uuid },
      },
    });
    if (!adminUser) throw new NotFoundException();
    const admin = Admin.fromAdminUser(adminUser);
    return admin;
  }

  //   async createMany(adminDtos: CreateAdminDto[]): Promise<AdminDto[]> {
  //     const admins = await this.databaseService.transaction(async (query) => {
  //       const createdAdmins = [];
  //       for (const adminDto of adminDtos) {
  //         const createdAdmin = await this.createOne(query, adminDto);
  //         createdAdmins.push(createdAdmin);
  //       }
  //       return createdAdmins;
  //     });
  //     return admins;
  //   }

  async deleteById(uuid: string): Promise<void> {
    const results = await this.adminUserRepository
      .createQueryBuilder()
      .softDelete()
      .where("admin_id = :adminId", { adminId: uuid })
      .andWhere("deleted_at IS NULL")
      .execute();
    if (results.affected && results.affected !== 1)
      throw new InternalServerErrorException();
  }
}
