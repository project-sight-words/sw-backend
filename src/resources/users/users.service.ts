import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User, UserDatum } from "entities/user.entities";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  findOneByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }

  async upsertByEmail(user: UserDatum): Promise<User> {
    const { email, lastLoggedIn } = user;
    const { generatedMaps } = await this.userRepository
      .createQueryBuilder()
      .insert()
      .into(User)
      .values({ email: email, lastLoggedIn: lastLoggedIn })
      .orUpdate(["last_logged_in"], ["email"])
      .returning("*")
      .execute();
    return generatedMaps[0] as User;
  }

  create(email: string): Promise<User> {
    const user = new User();
    user.email = email;
    return this.userRepository.save(user);
  }
}
