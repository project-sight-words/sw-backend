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

  async addClassToCentre(centre_id: string, class_id: string) {
    return this.centreRepository.addClassToCentre(centre_id, class_id);
  }

  async getClassesFromCentre(centre_id: string) {
    return this.centreRepository.getClassesFromCentre(centre_id);
  }

  async removeClassFromCentre(centre_id: string, class_id: string) {
    return this.centreRepository.removeClassFromCentre(centre_id, class_id);
  }
}
