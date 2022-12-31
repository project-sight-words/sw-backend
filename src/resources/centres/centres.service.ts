import { Centre, CentreEntity } from "entities/centre.entity";
import { CentresRepository } from "./centres.repository";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CentresService {
  constructor(private readonly centreRepository: CentresRepository) {}

  async get(): Promise<CentreEntity[]> {
    const centres = await this.centreRepository.get();
    return centres;
  }

  async getById(id: string): Promise<CentreEntity[]> {
    const centres = await this.centreRepository.getById(id);
    return centres;
  }

  async create(data: Centre): Promise<CentreEntity> {
    const centre = await this.centreRepository.insert(data);
    return centre;
  }

  async updateById(id: string, data: Centre): Promise<CentreEntity> {
    const centre = await this.centreRepository.updateById(id, data);
    return centre;
  }

  // TODO: async addClassToCentre(centreId: string, classId: string) {
  //   return this.centreRepository.addClassToCentre(centreId, classId);
  // }

  // async getClassesFromCentre(centreId: string) {
  //   return this.centreRepository.getClassesFromCentre(centreId);
  // }

  // async removeClassFromCentre(centreId: string, classId: string) {
  //   return this.centreRepository.removeClassFromCentre(centreId, classId);
  // }
}
