import { FastifyInstance } from "fastify";
import { SprintController } from "../../../application/controllers/SprintController";
import { Sprint } from "../../../domain/entities/Sprint";
import { AbstractRouter } from "./AbstractRouter";

export class SprintRouter extends AbstractRouter<Sprint> {
  constructor(controller: SprintController) {
    super(controller);
  }

  protected get SprintController(): SprintController {
    return this.controller as SprintController;
  }

  protected async addCustomRoutes(fastify: FastifyInstance): Promise<void> {
    fastify.post(
      "/:id/tickets", 
      this.SprintController.addTickets.bind(this.SprintController)
    );
    
    fastify.delete(
      "/:id/tickets", 
      this.SprintController.removeTickets.bind(this.SprintController)
    );
  }
}