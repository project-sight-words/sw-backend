import { AdminsRepository } from "./admins.repository";
import { CreateAdminDto } from "./dto/createAdmin.dto";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AdminsService {
  constructor(private readonly adminsRepository: AdminsRepository) {}

  async create(data: CreateAdminDto) {
    return await this.adminsRepository.create(data);
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
