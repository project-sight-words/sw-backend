import { Injectable } from "@nestjs/common";
import { Centre, ClassCentre } from "entities/centre.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Class } from "entities/class.entity";

@Injectable()
export class CentresService {
  constructor(
    @InjectRepository(Centre)
    private readonly centresRepository: Repository<Centre>,
    @InjectRepository(Class)
    private readonly classesReportory: Repository<Class>,
    @InjectRepository(ClassCentre)
    private readonly classCentreRepository: Repository<ClassCentre>,
  ) {}

  async get(): Promise<Centre[]> {
    const entities = await this.centresRepository.find();
    return entities;
  }

  async getById(id: string): Promise<Centre | null> {
    const entity = await this.centresRepository.findOneByOrFail({ id });
    return entity;
  }

  async addClassToCentre(centreId: string, classId: string) {
    await this.classCentreRepository.insert({
      centreId: centreId,
      classId: classId,
    });
  }

  async removeClassFromCentre(centreId: string, classId: string) {
    await this.classCentreRepository.softDelete({
      centreId: centreId,
      classId: classId,
    });
  }

  async getClassesByCentreId(centreId: string): Promise<Class[]> {
    const classes = await this.classesReportory
      .createQueryBuilder()
      .leftJoin(
        "class_centres",
        "classCentres",
        "classCentres.classId = Class.id",
      )
      .where("centre_id = :centreId", { centreId })
      .select("Class")
      .getMany();
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
