import { applyDecorators, SetMetadata } from "@nestjs/common";
import { ABAC } from "entities/abac.entities";

export const ABAC_KEY = "abac";
export const Access = (...abac: ABAC[]) =>
  applyDecorators(...abac.map((v) => SetMetadata(v, true)));
