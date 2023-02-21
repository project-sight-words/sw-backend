import { Admin, AdminDatum, AdminUser } from "entities/admin.entities";
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, EntityManager, In, Repository } from "typeorm";
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

  async findOneById(uuid: string): Promise<AdminUser | null> {
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
    return adminUser;
  }

  async findByIds(
    ids: string[],
    entityManager: EntityManager | null = null,
  ): Promise<AdminUser[]> {
    let adminUsers;
    const options = {
      relations: {
        user: true,
        admin: true,
      },
      withDeleted: false,
      where: { id: In(ids) },
    };

    if (!entityManager)
      adminUsers = await this.adminUserRepository.find(options);
    else adminUsers = await entityManager.find(AdminUser, options);

    return adminUsers;
  }

  async createManyAdmins(
    admins: AdminDatum[],
    querier: EntityManager | Repository<Admin> = this.adminRepository,
  ): Promise<void> {
    await querier
      .createQueryBuilder()
      .insert()
      .values(admins.map(() => ({})))
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
  ): Promise<AdminUser[]> {
    return this.dataSource.transaction(async (entityManager) => {
      const errors = this.validate(admins);
      if (errors.length !== 0) throw new BadRequestException(errors);

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

  private validate(admins: AdminDatum[]) {
    type AdminDatumWithRow = AdminDatum & { row: number };

    const emailsMap: Record<string, Omit<AdminDatumWithRow, "email">> = {};

    const errors: { index: number; message: string }[] = [];

    for (let i = 0; i < admins.length; i++) {
      const admin = admins[i];
      if (admin.email in emailsMap) {
        errors.push({
          index: i,
          message: `Duplicate email ${admin.email} on row ${
            emailsMap[admin.email].row
          }`,
        });
        continue;
      }

      emailsMap[admin.email] = {
        row: i,
      };
    }

    return errors;
  }
}
