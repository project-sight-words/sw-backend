import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { InsertQueryBuilder, Repository } from "typeorm";
import { User } from "../../entities/user.entities";

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private userRepository: Repository<User>) { }

  getByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }

  insert(email: string): Promise<User> {
    const user = new User();
    user.email = email;
    return this.userRepository.save(user);
  }
}