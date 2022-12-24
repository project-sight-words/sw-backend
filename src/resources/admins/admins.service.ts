import { Admin } from "entities/admin.entities";
import { AdminsRepository } from "./admins.repository";
import { AdminDto, CreateAdminDto } from "./dto/admins.dto";
import { DatabaseService } from "database/database.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import { instanceToPlain, plainToInstance } from "class-transformer";
import { Querier } from "database/database.types";
import { User } from "entities/user.entities";
import { UsersRepository } from "resources/users/users.repository";

@Injectable()
export class AdminsService {
  constructor(
    private readonly adminsRepository: AdminsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly databaseService: DatabaseService,
  ) {}

  async get(): Promise<AdminDto[]> {
    const admins = await this.adminsRepository.get();
    const adminDtos = admins.map((admin) => this.adminToDto(admin));
    return adminDtos;
  }

  async getById(id: string): Promise<AdminDto> {
    const admins = await this.adminsRepository.getById(id);
    if (admins.length == 0) {
      throw new NotFoundException();
    }
    const admin = admins[0];
    const adminDto = this.adminToDto(admin);
    return adminDto;
  }

  async createMany(adminDtos: CreateAdminDto[]): Promise<AdminDto[]> {
    const admins = await this.databaseService.transaction(async (query) => {
      const createdAdmins = [];
      for (const adminDto of adminDtos) {
        const createdAdmin = await this.createOne(query, adminDto);
        createdAdmins.push(createdAdmin);
      }
      return createdAdmins;
    });
    return admins;
  }

  async deleteById(id: string): Promise<AdminDto> {
    const admin = await this.adminsRepository.delete(id);
    const adminDto = this.adminToDto(admin);
    return adminDto;
  }

  private adminToDto(admin: Admin): AdminDto {
    return plainToInstance(AdminDto, instanceToPlain(admin));
  }

  private async createOne(
    query: Querier,
    adminDto: CreateAdminDto,
  ): Promise<AdminDto> {
    const { email } = adminDto;

    const usersWithEmail = await this.usersRepository.getByEmail(email);
    let user: User;
    if (usersWithEmail.length > 0) {
      user = usersWithEmail[0];
    } else {
      user = await this.usersRepository.insert(query, {
        email,
        lastLoggedIn: null,
      });
    }

    const userId = user.id;
    const adminUserLinks = await this.adminsRepository.getAdminUserByUserId(
      userId,
    );
    let adminId;
    if (adminUserLinks.length === 0) {
      adminId = await this.adminsRepository.insert(query);
      await this.adminsRepository.insertAdminUser(query, adminId, userId);
    } else {
      const adminUserLink = adminUserLinks[0];
      adminId = adminUserLink.adminId;
    }

    return {
      email,
      id: adminId,
    };
  }
}
