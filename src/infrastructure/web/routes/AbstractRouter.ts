import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { AbstractController } from "../../../application/controllers/AbstractController";
import { BaseEntity } from "../../../domain/entities/BaseEntity";

/**
 * Abstract router that automatically sets up CRUD routes for Fastify
 * @template T - Entity type
 */
export abstract class AbstractRouter<T extends BaseEntity> {
  constructor(protected readonly controller: AbstractController<T>) {}

  /**
   * Register all routes as a Fastify plugin
   */
  public plugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
    
    fastify.get("/", this.controller.getAll.bind(this.controller));
    fastify.get("/count", this.controller.count.bind(this.controller));
    fastify.get("/:id", this.controller.getById.bind(this.controller));

    fastify.post("/", this.controller.create.bind(this.controller));
    fastify.post("/bulk", this.controller.createMany.bind(this.controller));
    fastify.post("/exists", this.controller.exists.bind(this.controller));

    fastify.put("/:id", this.controller.update.bind(this.controller));
    fastify.patch("/bulk", this.controller.updateMany.bind(this.controller));

    fastify.delete("/:id", this.controller.delete.bind(this.controller));
    fastify.delete("/bulk", this.controller.deleteMany.bind(this.controller));

    await this.addCustomRoutes(fastify);
  };

  /**
   * Override this method to add custom routes specific to the entity
   */
  protected async addCustomRoutes(fastify: FastifyInstance): Promise<void> {
  }
}