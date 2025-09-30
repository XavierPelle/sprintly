import { FastifyInstance } from "fastify";
import { TestController } from "../../../application/controllers/TestController";
import { Test } from "../../../domain/entities/Test";
import { AbstractRouter } from "./AbstractRouter";
import { authMiddleware } from "../middlewares/AuthMiddleware";

export class TestRouter extends AbstractRouter<Test> {
  constructor(controller: TestController) {
    super(controller);
  }

  protected get TestController(): TestController {
    return this.controller as TestController;
  }

  protected async addCustomRoutes(fastify: FastifyInstance): Promise<void> {
    // POST /tests/ticket/:ticketId - Create test for ticket
    fastify.post(
      "/ticket/:ticketId",
      { onRequest: [authMiddleware] },
      this.TestController.createForTicket.bind(this.TestController)
    );

    // PATCH /tests/:id/validate - Validate or reject test
    fastify.patch(
      "/:id/validate",
      { onRequest: [authMiddleware] },
      this.TestController.validateTest.bind(this.TestController)
    );
  }
}