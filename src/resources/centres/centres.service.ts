import { CentreDto } from "./dto/centres.dto";
import { CentresRepository } from "./centres.repository";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CentresService {
  constructor(private readonly centreRepository: CentresRepository) {}

  async get(): Promise<CentreDto[]> {
    const centres = await this.centreRepository.get();
    const centreDtos = centres.map((centre) => CentreDto.fromEntity(centre));
    return centreDtos;
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
