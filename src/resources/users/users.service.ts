import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "entities/user.entities";
import { EntityManager, FindManyOptions, In, Repository } from "typeorm";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  findOneByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }

  async findByEmails(
    emails: string[],
    querier: EntityManager | Repository<User> = this.userRepository,
  ): Promise<User[]> {
    const options: FindManyOptions<User> = {
      where: {
        email: In(emails),
      },
    };
    return querier instanceof EntityManager
      ? await querier.find(User, options)
      : await querier.find(options);
  }

  async upsertByEmail(email: string, lastLoggedIn: Date): Promise<User> {
    const { generatedMaps } = await this.userRepository
      .createQueryBuilder()
      .insert()
      .into(User)
      .values({ email: email, lastLoggedIn: lastLoggedIn })
      .orUpdate(["last_logged_in"], ["email"])
      .returning("*")
      .execute();

    return User.from(generatedMaps)[0];
  }

  create(email: string): Promise<User> {
    const user = new User();
    user.email = email;
    return this.userRepository.save(user);
  }

  async createManyIfNotExists(
    emails: string[],
    entityManager: EntityManager | null = null,
  ): Promise<User[]> {
    let qb = this.userRepository.createQueryBuilder();
    if (entityManager) qb = entityManager.createQueryBuilder(User, "users");
    const { generatedMaps } = await qb
      .insert()
      .values(emails.map((email) => ({ email })))
      .orIgnore()
      .returning("*")
      .execute();

    return User.from(generatedMaps);
  }
}
