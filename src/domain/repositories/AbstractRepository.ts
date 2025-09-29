import { Repository, FindOptionsWhere, FindManyOptions, DeepPartial } from "typeorm";
import { BaseEntity } from "../entities/BaseEntity";

/**
 * Abstract repository providing basic CRUD operations for TypeORM entities
 * @template T - Entity type
 */
export abstract class AbstractRepository<T extends BaseEntity> {
  constructor(protected readonly repository: Repository<T>) {}

  /**
   * Retrieves all records with optional query options
   * @param options - TypeORM find options (relations, order, pagination, etc.)
   * @returns Promise resolving to an array of entities
   */
  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return this.repository.find(options);
  }

  /**
   * Finds a single entity by its primary key (ID)
   * @param id - Primary key of the entity
   * @returns Promise resolving to the entity or null if not found
   */
  async findById(id: number): Promise<T | null> {
    return this.repository.findOne({
      where: { id } as FindOptionsWhere<T>
    });
  }

  /**
   * Finds a single entity matching the given contextual criteria
   * @param where - Search criteria (e.g., { email: 'user@example.com' })
   * @param options - Additional options (relations, select, order, etc.)
   * @returns Promise resolving to the entity or null if not found
   */
  async findOne(
    where: FindOptionsWhere<T>,
    options?: Omit<FindManyOptions<T>, 'where'>
  ): Promise<T | null> {
    return this.repository.findOne({
      where,
      ...options
    });
  }

  /**
   * Finds multiple entities matching the given contextual criteria
   * @param where - Search criteria
   * @param options - Additional options (relations, order, pagination, etc.)
   * @returns Promise resolving to an array of matching entities
   */
  async findBy(
    where: FindOptionsWhere<T>,
    options?: Omit<FindManyOptions<T>, 'where'>
  ): Promise<T[]> {
    return this.repository.find({
      where,
      ...options
    });
  }

  /**
   * Counts the number of entities matching optional criteria
   * @param where - Optional search criteria
   * @returns Promise resolving to the count of matching records
   */
  async count(where?: FindOptionsWhere<T>): Promise<number> {
    return this.repository.count({ where });
  }

  /**
   * Creates and persists a new entity
   * @param data - Partial entity data to create
   * @returns Promise resolving to the created entity with generated fields
   */
  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  /**
   * Creates and persists multiple entities in a single transaction
   * @param data - Array of partial entity data to create
   * @returns Promise resolving to an array of created entities
   */
  async createMany(data: DeepPartial<T>[]): Promise<T[]> {
    const entities = this.repository.create(data);
    return this.repository.save(entities);
  }

  /**
   * Updates an existing entity by ID
   * @param id - Primary key of the entity to update
   * @param data - Partial entity data to update
   * @returns Promise resolving to the updated entity or null if not found
   */
  async update(id: number, data: DeepPartial<T>): Promise<T | null> {
    await this.repository.update(id, data as any);
    return this.findById(id);
  }

  /**
   * Updates multiple entities matching the given criteria
   * @param where - Selection criteria for entities to update
   * @param data - Partial entity data to update
   * @returns Promise resolving when update is complete
   */
  async updateMany(
    where: FindOptionsWhere<T>,
    data: DeepPartial<T>
  ): Promise<void> {
    await this.repository.update(where, data as any);
  }

  /**
   * Deletes an entity by ID
   * @param id - Primary key of the entity to delete
   * @returns Promise resolving to true if deleted, false if not found
   */
  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  /**
   * Deletes multiple entities matching the given criteria
   * @param where - Selection criteria for entities to delete
   * @returns Promise resolving to the number of deleted entities
   */
  async deleteMany(where: FindOptionsWhere<T>): Promise<number> {
    const result = await this.repository.delete(where);
    return result.affected ?? 0;
  }

  /**
   * Checks if an entity exists matching the given criteria
   * @param where - Search criteria
   * @returns Promise resolving to true if entity exists, false otherwise
   */
  async exists(where: FindOptionsWhere<T>): Promise<boolean> {
    const count = await this.repository.count({ where });
    return count > 0;
  }

  /**
   * Saves an entity (creates if new, updates if existing)
   * @param entity - Entity to save
   * @returns Promise resolving to the saved entity
   */
  async save(entity: DeepPartial<T>): Promise<T> {
    return this.repository.save(entity);
  }
}