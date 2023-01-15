import { InternalServerErrorException } from "@nestjs/common";

export function getOrError<K, V>(map: Map<K, V>, key: K): V {
  const value = map.get(key);
  if (!value) throw new InternalServerErrorException();
  return value;
}
