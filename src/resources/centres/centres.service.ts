import { CentreDatum, CentreEntity } from "entities/centre.entity";
import { CentresRepository } from "./centres.repository";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CentresService {
  constructor(private readonly centreRepository: CentresRepository) {}

  async get(): Promise<CentreEntity[]> {
    const entities = await this.centreRepository.get();
    return entities;
  }

  async getById(id: string): Promise<CentreEntity[]> {
    const entities = await this.centreRepository.getById(id);
    return entities;
  }

  async create(data: CentreDatum): Promise<CentreEntity> {
    const entity = await this.centreRepository.insert(data);
    return entity;
  }

  async updateById(id: string, data: CentreDatum): Promise<CentreEntity> {
    const entity = await this.centreRepository.updateById(id, data);
    return entity;
  }
}
