import * as ClassTransformer from "class-transformer";

export function plainToInstance<T, V>(
  cls: ClassTransformer.ClassConstructor<T>,
  plain: V[],
): T[];
export function plainToInstance<T, V>(
  cls: ClassTransformer.ClassConstructor<T>,
  plain: V,
): T;
export function plainToInstance<T>(
  object: ClassTransformer.ClassConstructor<T>,
  plain: unknown,
): unknown {
  return ClassTransformer.plainToInstance(object, plain, {
    excludeExtraneousValues: true,
  });
}

export function instanceToPlain<T>(object: T): Record<string, unknown>;
export function instanceToPlain<T>(object: T[]): Record<string, unknown>[];
export function instanceToPlain(object: unknown): unknown {
  return ClassTransformer.instanceToPlain(object);
}
