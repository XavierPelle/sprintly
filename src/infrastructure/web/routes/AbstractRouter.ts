import {
   FastifyInstance,
   FastifyPluginAsync
} from "fastify";
import {
   AbstractController
} from "../../../application/controllers/AbstractController";
import {
   BaseEntity
} from "../../../domain/entities/BaseEntity";
import {
   authMiddleware
} from "../middlewares/AuthMiddleware";

/**
 * Abstract router that automatically sets up CRUD routes for Fastify
 * @template T - Entity type
 */
export abstract class AbstractRouter < T extends BaseEntity > {
   constructor(protected readonly controller: AbstractController < T > ) {}

   /**
    * Register all routes as a Fastify plugin
    */
   public plugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {


      fastify.get("/", {
         onRequest: [authMiddleware]
      }, this.controller.getAll.bind(this.controller));

      fastify.get("/count", {
         onRequest: [authMiddleware]
      }, this.controller.count.bind(this.controller));

      fastify.get("/:id", {
         onRequest: [authMiddleware]
      }, this.controller.getById.bind(this.controller));

      fastify.post("/", {
         onRequest: [authMiddleware]
      }, this.controller.create.bind(this.controller));

      fastify.post("/bulk", {
         onRequest: [authMiddleware]
      }, this.controller.createMany.bind(this.controller));

      fastify.post("/exists", {
         onRequest: [authMiddleware]
      }, this.controller.exists.bind(this.controller));

      fastify.put("/:id", {
         onRequest: [authMiddleware]
      }, this.controller.update.bind(this.controller));

      fastify.patch("/bulk", {
         onRequest: [authMiddleware]
      }, this.controller.updateMany.bind(this.controller));

      fastify.delete("/:id", {
         onRequest: [authMiddleware]
      }, this.controller.delete.bind(this.controller));
      
      fastify.delete("/bulk", {
         onRequest: [authMiddleware]
      }, this.controller.deleteMany.bind(this.controller));

      await this.addCustomRoutes(fastify);
   };

   /**
    * Override this method to add custom routes specific to the entity
    */
   protected async addCustomRoutes(fastify: FastifyInstance): Promise < void > {}
}