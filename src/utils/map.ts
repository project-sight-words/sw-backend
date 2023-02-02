import { InternalServerErrorException, Logger } from "@nestjs/common";

export function getOrError<K, V>(map: Map<K, V>, key: K, logger: Logger): V {
  const value = map.get(key);
  if (!value) {
    logger.error(`Cannot find key in map`);
    throw new InternalServerErrorException();
  }
  return value;
}
