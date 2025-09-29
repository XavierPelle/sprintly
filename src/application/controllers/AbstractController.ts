import { FastifyRequest, FastifyReply } from "fastify";
import { AbstractRepository } from "../../domain/repositories/AbstractRepository";
import { BaseEntity } from "../../domain/entities/BaseEntity";
import { FindOptionsWhere } from "typeorm";

/**
 * Abstract controller providing standard CRUD endpoints for Fastify
 * @template T - Entity type
 */
export abstract class AbstractController<T extends BaseEntity> {
  constructor(protected readonly repository: AbstractRepository<T>) {}

  /**
   * GET / - Retrieve all entities
   */
  async getAll(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { page, limit, ...filters } = request.query as any;
      
      const options: any = {};
      
      if (page && limit) {
        options.skip = (Number(page) - 1) * Number(limit);
        options.take = Number(limit);
      }

      const entities = await this.repository.findAll(options);
      reply.send(entities);
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /:id - Retrieve a single entity by ID
   */
  async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply): Promise<void> {
    try {
      const id = Number(request.params.id);
      const entity = await this.repository.findById(id);

      if (!entity) {
        return reply.status(404).send({ message: "Entity not found" });
      }

      reply.send(entity);
    } catch (error) {
      throw error;
    }
  }

  /**
   * POST / - Create a new entity
   */
  async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const entity = await this.repository.create(request.body as any);
      reply.status(201).send(entity);
    } catch (error) {
      throw error;
    }
  }

  /**
   * POST /bulk - Create multiple entities
   */
  async createMany(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      if (!Array.isArray(request.body)) {
        return reply.status(400).send({ message: "Request body must be an array" });
      }

      const entities = await this.repository.createMany(request.body);
      reply.status(201).send(entities);
    } catch (error) {
      throw error;
    }
  }

  /**
   * PUT /:id - Update an entity by ID
   */
  async update(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply): Promise<void> {
    try {
      const id = Number(request.params.id);
      const entity = await this.repository.update(id, request.body as any);

      if (!entity) {
        return reply.status(404).send({ message: "Entity not found" });
      }

      reply.send(entity);
    } catch (error) {
      throw error;
    }
  }

  /**
   * PATCH /bulk - Update multiple entities
   */
  async updateMany(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { where, data } = request.body as any;

      if (!where || !data) {
        return reply.status(400).send({ message: "Both 'where' and 'data' are required" });
      }

      await this.repository.updateMany(where as FindOptionsWhere<T>, data);
      reply.send({ message: "Entities updated successfully" });
    } catch (error) {
      throw error;
    }
  }

  /**
   * DELETE /:id - Delete an entity by ID
   */
  async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply): Promise<void> {
    try {
      const id = Number(request.params.id);
      const deleted = await this.repository.delete(id);

      if (!deleted) {
        return reply.status(404).send({ message: "Entity not found" });
      }

      reply.status(204).send();
    } catch (error) {
      throw error;
    }
  }

  /**
   * DELETE /bulk - Delete multiple entities
   */
  async deleteMany(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { where } = request.body as any;

      if (!where) {
        return reply.status(400).send({ message: "'where' criteria is required" });
      }

      const count = await this.repository.deleteMany(where as FindOptionsWhere<T>);
      reply.send({ message: `${count} entities deleted`, count });
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /count - Count entities matching criteria
   */
  async count(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const where = request.query as FindOptionsWhere<T>;
      const count = await this.repository.count(Object.keys(where).length ? where : undefined);
      reply.send({ count });
    } catch (error) {
      throw error;
    }
  }

  /**
   * POST /exists - Check if entity exists
   */
  async exists(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { where } = request.body as any;

      if (!where) {
        return reply.status(400).send({ message: "'where' criteria is required" });
      }

      const exists = await this.repository.exists(where as FindOptionsWhere<T>);
      reply.send({ exists });
    } catch (error) {
      throw error;
    }
  }
}