import { Centre } from "entities/centre.entity";
import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";

@Injectable()
export class CentresRepository extends Repository<Centre> {
  constructor(private dataSource: DataSource) {
    super(Centre, dataSource.createEntityManager());
  }
}
