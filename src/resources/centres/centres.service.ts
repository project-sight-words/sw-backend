import { Injectable } from "@nestjs/common";
import { Centre } from "entities/centre.entities";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Class } from "entities/class.entities";

@Injectable()
export class CentresService {
  constructor(
    @InjectRepository(Centre)
    private readonly centresRepository: Repository<Centre>,
    @InjectRepository(Class)
    private readonly classesRepository: Repository<Class>,
  ) {}

  async get(): Promise<Centre[]> {
    const entities = await this.centresRepository.find();
    return entities;
  }

  async getById(id: string): Promise<Centre | null> {
    const entity = await this.centresRepository.findOneByOrFail({ id });
    return entity;
  }

  async getClassesByCentreId(centreId: string): Promise<Class[]> {
    const classes = await this.classesRepository.find({
      where: {
        classCentre: {
          centreId,
        },
      },
    });
    return classes;
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
