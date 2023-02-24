import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User, UserDatum } from "entities/user.entities";
import { Repository } from "typeorm";

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
    return User.fromObject(generatedMaps[0]);
  }

  create(email: string): Promise<User> {
    const user = new User();
    user.email = email;
    return this.userRepository.save(user);
  }
}
