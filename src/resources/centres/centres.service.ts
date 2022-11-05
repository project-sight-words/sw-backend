import { Injectable } from "@nestjs/common";
import { CentresRepository } from "./centres.repository";

@Injectable()
export class CentresService {
  constructor(private readonly centreRepository: CentresRepository) {}

  async findAll() {
    return this.centreRepository.findAll();
  }

  async findOne(id: string) {
    return this.centreRepository.findOne(id);
  }

  async addClassToCentre(centreId: string, classId: string) {
    return this.centreRepository.addClassToCentre(centreId, classId);
  }

  async getClassesFromCentre(centreId: string) {
    return this.centreRepository.getClassesFromCentre(centreId);
  }

  async removeClassFromCentre(centreId: string, classId: string) {
    return this.centreRepository.removeClassFromCentre(centreId, classId);
  }
}
