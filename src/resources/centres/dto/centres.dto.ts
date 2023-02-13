import { PickType } from "@nestjs/mapped-types";
import { ClassCentre } from "entities/centre.entity";

export class CentreDto {}

export class CreateClassCentreDto extends PickType(ClassCentre, ["classId"]) {}
