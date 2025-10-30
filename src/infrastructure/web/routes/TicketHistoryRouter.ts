import { FastifyInstance } from "fastify";
import { TicketHistoryController } from "../../../application/controllers/TicketHistoryController";
import { TicketHistory } from "../../../domain/entities/TicketHistory";
import { AbstractRouter } from "./AbstractRouter";
import { authMiddleware } from "../middlewares/AuthMiddleware";

export class TicketHistoryRouter extends AbstractRouter<TicketHistory> {
  constructor(controller: TicketHistoryController) {
    super(controller);
  }

  protected get TicketHistoryController(): TicketHistoryController {
    return this.controller as TicketHistoryController;
  }

  protected async addCustomRoutes(fastify: FastifyInstance): Promise<void> {

  }
}