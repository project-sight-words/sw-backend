import { Injectable, NotFoundException } from "@nestjs/common";
import { Centre } from "entities/centre.entities";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
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

  async create(centreName: string): Promise<Centre> {
    const centre = new Centre();
    centre.name = centreName;
    const existing = await this.centresRepository.findOne({
      where: { name: centreName },
      withDeleted: true,
    });

    if (existing?.deletedAt) {
      await this.centresRepository.restore(existing.id);
      return existing;
    }

    const entity = await this.centresRepository.save(centre);
    return entity;
  }

  async createMany(centreNames: string[]): Promise<Centre[]> {
    await this.centresRepository
      .createQueryBuilder()
      .insert()
      .values(centreNames.map((centreName) => ({ name: centreName })))
      .orIgnore()
      .execute();
    const insertedCentres = await this.centresRepository.find({
      withDeleted: false,
      where: { name: In(centreNames) },
    });
    return insertedCentres;
  }

  async updateById(id: string, centreName: string): Promise<Centre> {
    const centre = await this.centresRepository.findOneBy({ id: id });
    if (!centre) throw new NotFoundException();
    centre.name = centreName;
    const entity = await this.centresRepository.save(centre);
    return entity;
  }

  async deleteById(id: string): Promise<Centre> {
    // Preload classCentres to ensure softRemove cascading
    const centre = await this.centresRepository.findOne({
      relations: {
        classCentres: true,
      },
      where: {
        id,
      },
    });
    if (!centre) throw new NotFoundException();
    const entity = await this.centresRepository.softRemove(centre);
    return entity;
  }
}
