import { AdminsRepository } from "./admins.repository";
import { CreateAdminDto } from "./dto/createAdmin.dto";
import { Injectable } from "@nestjs/common";
import { NewUser } from "entities/user.entities";
import { UsersRepository } from "resources/users/users.repository";

@Injectable()
export class AdminsService {
  constructor(
    private readonly adminsRepository: AdminsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async create(data: CreateAdminDto) {
    const userData: NewUser = {
      email: data.email,
      lastLoggedIn: new Date(),
    };
    const userToMakeAdmin = await this.usersRepository.upsertByEmail(userData);

    return await this.adminsRepository.create(userToMakeAdmin.id);
  }

  async getAll() {
    return await this.adminsRepository.getAll();
  }

  async getById(id: string) {
    return await this.adminsRepository.getById(id);
  }

  async deleteById(id: string) {
    return await this.adminsRepository.deleteById(id);
  }
}
