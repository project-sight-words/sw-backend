import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "entities/user.entities";
import { EntityManager, In, Repository } from "typeorm";
import { plainToInstance } from "utils/transformer";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  findOneByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }

  findByEmails(emails: string[]): Promise<User[]> {
    return this.userRepository.find({
      where: {
        email: In(emails),
      },
    });
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
    return plainToInstance(User, generatedMaps[0]);
  }

  create(email: string): Promise<User> {
    const user = new User();
    user.email = email;
    return this.userRepository.save(user);
  }

  async createManyIfNotExists(
    emails: string[],
    entityManager: EntityManager,
  ): Promise<User[]> {
    const { generatedMaps } = await entityManager
      .createQueryBuilder()
      .insert()
      .values(emails.map((email) => ({ email })))
      .orIgnore()
      .returning("*")
      .execute();

    return plainToInstance(User, generatedMaps);
  }
}
