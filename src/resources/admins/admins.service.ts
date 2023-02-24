import { Admin, AdminDatum, AdminUser } from "entities/admin.entities";
import { CreateErrorMessage } from "utils/createErrorMessage";
import {
  DataSource,
  EntityManager,
  FindManyOptions,
  In,
  Repository,
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
    querier: EntityManager | Repository<Admin> = this.adminRepository,
  ): Promise<void> {
    await querier
      .createQueryBuilder()
      .insert()
      .values(AdminDatum.toCreateObjects(admins))
      .execute();
  }

  async bulkInsertAdminUsers(
    admins: AdminDatum[],
    querier: EntityManager | DataSource = this.dataSource,
  ): Promise<string[]> {
    // TODO: Refactor to guard against potential SQL injection
    const association = admins.map((s) => `('${s.email}')`).join(", ");

    const insertedAdminUsers: { id: string }[] = (await querier.query(`
        INSERT INTO admin_users (user_id, admin_id)
        SELECT p.uid, p.aid
        FROM (SELECT users.id AS uid, admins.id AS aid, users.email AS email
              FROM admins,
                   users) AS p
                 JOIN (VALUES ${association}) AS a (e, s)
                      ON a.e = p.email
        RETURNING *;
    `)) as { id: string }[];

    return insertedAdminUsers.map(({ id }) => id);
  }

  async createMany(
    admins: AdminDatum[],
    createdBy: string | null = null,
  ): Promise<AdminUser[] | CreateErrorMessage[]> {
    return this.dataSource.transaction(async (entityManager) => {
      const errors = this.validate(admins);
      if (errors.length !== 0) return errors;

      const emails = admins.map((a) => a.email);
      const [ids] = await Promise.all([
        this.bulkInsertAdminUsers(admins, entityManager),
        // TODO: Uncomment following after usersService updated
        // this.usersService.createManyIfNotExists(emails, entityManager),
        this.createManyAdmins(admins, entityManager),
      ]);
      return this.findByIds(ids);
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
