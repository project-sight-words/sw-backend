import { Admin, AdminDatum, AdminUser } from "entities/admin.entities";
import { CreateErrorMessage } from "utils/createErrorMessage";
import {
  DataSource,
  EntityManager,
  FindManyOptions,
  In,
  Repository,
  SelectQueryBuilder,
} from "typeorm";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UsersService } from "resources/users/users.service";

@Injectable()
export class AdminsService {
  constructor(
    private readonly usersService: UsersService,
    private readonly dataSource: DataSource,
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(AdminUser)
    private readonly adminUserRepository: Repository<AdminUser>,
  ) {}

  async get(): Promise<AdminUser[]> {
    const adminUsers = await this.adminUserRepository.find({
      relations: {
        user: true,
        admin: true,
      },
      withDeleted: false,
    });
    return adminUsers;
  }

  async findOneById(id: string): Promise<AdminUser | null> {
    const adminUser = await this.adminUserRepository.findOne({
      relations: {
        user: true,
        admin: true,
      },
      withDeleted: false,
      where: {
        admin: { id },
      },
    });
    return adminUser;
  }

  async findByIds(
    ids: string[],
    querier: EntityManager | Repository<AdminUser> = this.adminUserRepository,
  ): Promise<AdminUser[]> {
    const options: FindManyOptions<AdminUser> = {
      relations: {
        user: true,
        admin: true,
      },
      withDeleted: false,
      where: { id: In(ids) },
    };

    return querier instanceof EntityManager
      ? await querier.find(AdminUser, options)
      : await querier.find(options);
  }

  async createManyAdmins(
    admins: AdminDatum[],
    queryBuilder: SelectQueryBuilder<Admin> = this.adminRepository.createQueryBuilder(),
  ): Promise<Admin[]> {
    const { generatedMaps } = await queryBuilder
      .insert()
      .values(AdminDatum.toCreateObjects(admins))
      .returning("*")
      .execute();

    return Admin.from(generatedMaps);
  }

  async createMany(
    admins: AdminDatum[],
    createdBy: string | null = null,
  ): Promise<AdminUser[] | CreateErrorMessage[]> {
    return this.dataSource.transaction(async (entityManager) => {
      const errors = this.validate(admins);
      if (errors.length !== 0) return errors;

      const emails = admins.map((a) => a.email);
      await this.usersService.createManyIfNotExists(emails, entityManager);

      const users = await this.usersService.findByEmails(emails, entityManager);
      const userIds = users.map((u) => u.id);

      const options: FindManyOptions<AdminUser> = {
        relations: {
          user: true,
          admin: true,
        },
        withDeleted: false,
        where: { userId: In(userIds) },
      };
      const existingAdminUsers: AdminUser[] = await entityManager.find(
        AdminUser,
        options,
      );
      const existingAdminUserUsers = existingAdminUsers.map((au) => au.user);

      // Create new admins
      const existingAdminUserEmails = existingAdminUserUsers.map(
        (u) => u.email,
      );
      const adminsToCreate = admins.filter(
        (a) => !existingAdminUserEmails.includes(a.email),
      );
      const createdAdmins = await this.createManyAdmins(
        adminsToCreate,
        entityManager.createQueryBuilder(Admin, "admins"),
      );

      // Create new adminUsers
      const usersToCreateLink = users.filter((u) =>
        adminsToCreate.map((a) => a.email).includes(u.email),
      );
      await entityManager
        .createQueryBuilder(AdminUser, "admin_users")
        .insert()
        .values(AdminUser.toCreateObjects(usersToCreateLink, createdAdmins))
        .execute();

      return await entityManager.find(AdminUser, options);
    });
  }

  async deleteById(id: string): Promise<void> {
    const results = await this.adminUserRepository
      .createQueryBuilder()
      .softDelete()
      .where("admin_id = :adminId", { adminId: id })
      .andWhere("deleted_at IS NULL")
      .execute();
    if (results.affected && results.affected !== 1)
      throw new InternalServerErrorException();
  }

  private validate(admins: AdminDatum[]) {
    type AdminDatumWithRow = AdminDatum & { row: number };

    const emailsMap = new Map<string, Omit<AdminDatumWithRow, "email">>();

    const errors: { index: number; message: string }[] = [];

    for (let i = 0; i < admins.length; i++) {
      const admin = admins[i];
      if (emailsMap.has(admin.email)) {
        errors.push({
          index: i,
          message: `Duplicate email ${admin.email} on row ${
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            emailsMap.get(admin.email)!.row
          }`,
        });
        continue;
      }

      emailsMap.set(admin.email, {
        row: i,
      });
    }

    return errors;
  }
}
