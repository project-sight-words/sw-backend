import { CentresRepository } from "./centres.repository";
import { Injectable } from "@nestjs/common";
import { Centre } from "entities/centre.entity";

@Injectable()
export class CentresService {
  constructor(private readonly centresRepository: CentresRepository) {}

  async get(): Promise<Centre[]> {
    const entities = await this.centresRepository.find();
    return entities;
  }

  async getById(id: string): Promise<Centre> {
    const entity = await this.centresRepository.findOneByOrFail({ id });
    return entity;
  }

  // CUD not supported
  // async create(centre: Centre): Promise<Centre> {
  //   const entity = await this.centresRepository.save(centre);
  //   return entity;
  // }

  // async updateById(id: string, centre: Centre): Promise<Centre> {
  //   centre.updatedAt = new Date();
  //   // centre.updatedBy = null; // TODO: Change after authentication
  //   await this.centresRepository.update(id, centre);
  //   return centre;
  // }
}
