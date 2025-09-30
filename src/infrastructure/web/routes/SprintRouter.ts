import { FastifyInstance } from "fastify";
import { SprintController } from "../../../application/controllers/SprintController";
import { Sprint } from "../../../domain/entities/Sprint";
import { AbstractRouter } from "./AbstractRouter";
import { authMiddleware } from "../middlewares/AuthMiddleware";

export class SprintRouter extends AbstractRouter<Sprint> {
  constructor(controller: SprintController) {
    super(controller);
  }

  protected get SprintController(): SprintController {
    return this.controller as SprintController;
  }

  protected async addCustomRoutes(fastify: FastifyInstance): Promise<void> {
    // GET /sprints/:id/details - Get sprint details with stats
    fastify.get(
      "/:id/details",
      { onRequest: [authMiddleware] },
      this.SprintController.getDetails.bind(this.SprintController)
    );

    // GET /sprints/:id/burndown - Get burndown chart data
    fastify.get(
      "/:id/burndown",
      { onRequest: [authMiddleware] },
      this.SprintController.getBurndown.bind(this.SprintController)
    );

    // POST /sprints/:id/close - Close sprint
    fastify.post(
      "/:id/close",
      { onRequest: [authMiddleware] },
      this.SprintController.closeSprint.bind(this.SprintController)
    );

    // POST /sprints/:id/tickets - Add tickets to sprint
    fastify.post(
      "/:id/tickets", 
      { onRequest: [authMiddleware] },
      this.SprintController.addTickets.bind(this.SprintController)
    );
    
    // DELETE /sprints/:id/tickets - Remove tickets from sprint
    fastify.delete(
      "/:id/tickets", 
      { onRequest: [authMiddleware] },
      this.SprintController.removeTickets.bind(this.SprintController)
    );
  }
}