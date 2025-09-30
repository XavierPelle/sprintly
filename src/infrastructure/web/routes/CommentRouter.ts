import { FastifyInstance } from "fastify";
import { CommentController } from "../../../application/controllers/CommentController";
import { Comment } from "../../../domain/entities/Comment";
import { AbstractRouter } from "./AbstractRouter";
import { authMiddleware } from "../middlewares/AuthMiddleware";

export class CommentRouter extends AbstractRouter<Comment> {
  constructor(controller: CommentController) {
    super(controller);
  }

  protected get CommentController(): CommentController {
    return this.controller as CommentController;
  }

  protected async addCustomRoutes(fastify: FastifyInstance): Promise<void> {
    // POST /ticket/:ticketId - Create comment on ticket
    fastify.post(
      "/ticket/:ticketId",
      { onRequest: [authMiddleware] },
      this.CommentController.createOnTicket.bind(this.CommentController)
    );
  }
}