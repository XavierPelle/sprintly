import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { DataSource } from "typeorm";

import { User } from "../../../domain/entities/User";
import { Ticket } from "../../../domain/entities/Ticket";
import { Comment } from "../../../domain/entities/Comment";
import { Sprint } from "../../../domain/entities/Sprint";

import { UserRepository } from "../../../domain/repositories/UserRepository";
import { TicketRepository } from "../../../domain/repositories/TicketRepository";
import { CommentRepository } from "../../../domain/repositories/CommentRepository";
import { SprintRepository } from "../../../domain/repositories/SprintRepository";

import { UserController } from "../../../application/controllers/UserController";
import { TicketController } from "../../../application/controllers/TicketController";
import { CommentController } from "../../../application/controllers/CommentController";
import { SprintController } from "../../../application/controllers/SprintController";

import { UserRouter } from "./UserRouter";
import { TicketRouter } from "./TicketRouter";
import { CommentRouter } from "./CommentRouter";
import { SprintRouter } from "./SprintRouter";


export class RouteFactory {
  constructor(private readonly dataSource: DataSource) {}

  public createApiPlugin(): FastifyPluginAsync {
    return async (fastify: FastifyInstance) => {
      await fastify.register(this.createUserPlugin(), { prefix: "/users" });
      await fastify.register(this.createTicketPlugin(), { prefix: "/tickets" });
      await fastify.register(this.createCommentPlugin(), { prefix: "/comments" });
      await fastify.register(this.createSprintPlugin(), { prefix: "/sprints" });
    };
  }

  private createUserPlugin(): FastifyPluginAsync {
    const repository = new UserRepository(this.dataSource.getRepository(User));
    const controller = new UserController(repository);
    const router = new UserRouter(controller);
    return router.plugin;
  }

  private createTicketPlugin(): FastifyPluginAsync {
    const repository = new TicketRepository(this.dataSource.getRepository(Ticket));
    const controller = new TicketController(repository);
    const router = new TicketRouter(controller);
    return router.plugin;
  }

  private createCommentPlugin(): FastifyPluginAsync {
    const repository = new CommentRepository(this.dataSource.getRepository(Comment));
    const controller = new CommentController(repository);
    const router = new CommentRouter(controller);
    return router.plugin;
  }

  private createSprintPlugin(): FastifyPluginAsync {
    const sprintRepository = new SprintRepository(this.dataSource.getRepository(Sprint));
    const ticketRepository = new TicketRepository(this.dataSource.getRepository(Ticket));
    const controller = new SprintController(sprintRepository, ticketRepository);
    const router = new SprintRouter(controller);
    return router.plugin;
  }
}