import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { Class } from "entities/class.entity";

@Injectable()
export class ClassesRepository extends Repository<Class> {
  constructor(private dataSource: DataSource) {
    super(Class, dataSource.createEntityManager());
  }
}
