import { CentreDto } from "./dto/centres.dto";
import { CentresRepository } from "./centres.repository";
import { Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class CentresService {
  constructor(private readonly centreRepository: CentresRepository) {}

  async get(): Promise<CentreDto[]> {
    const centres = await this.centreRepository.get();
    const centreDtos = centres.map((centre) => CentreDto.fromEntity(centre));
    return centreDtos;
  }

  async getById(id: string): Promise<CentreDto> {
    const centres = await this.centreRepository.getById(id);
    if (centres.length === 0) throw new NotFoundException();
    const centre = centres[0];
    const centreDto = CentreDto.fromEntity(centre);
    return centreDto;
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
