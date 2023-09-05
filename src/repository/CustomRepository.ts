import { Repository, DeepPartial, SaveOptions, FindOneOptions } from "typeorm";

interface Identifiable {
  id: string | number;
  deletedAt?: Date | null;
}

export class CustomRepository<T extends Identifiable> extends Repository<T> {
  async saveOrRestore(
    entity: DeepPartial<T>,
    options?: SaveOptions,
  ): Promise<T> {
    // Define type for your find options
    const findOptions: FindOneOptions<T> = {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      where: { id: entity.id } as any,
      withDeleted: true,
    };

    let existingEntity = await this.findOne(findOptions);

    if (existingEntity && existingEntity.deletedAt) {
      // Restore and update the soft-deleted entry
      existingEntity = this.merge(existingEntity, {
        ...entity,
        deletedAt: null,
      });
      return await this.save(existingEntity, options);
    } else if (!existingEntity) {
      // Insert a new entry
      return await this.save(entity, options);
    } else {
      throw new Error("Entity already exists and is not soft-deleted.");
    }
  }
}
