import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { DataSource } from "typeorm";

import { User } from "../../../domain/entities/User";
import { Ticket } from "../../../domain/entities/Ticket";
import { Comment } from "../../../domain/entities/Comment";
import { Sprint } from "../../../domain/entities/Sprint";
import { Test } from "../../../domain/entities/Test";
import { Image } from "../../../domain/entities/Image";

import { UserRepository } from "../../../domain/repositories/UserRepository";
import { TicketRepository } from "../../../domain/repositories/TicketRepository";
import { CommentRepository } from "../../../domain/repositories/CommentRepository";
import { SprintRepository } from "../../../domain/repositories/SprintRepository";
import { TestRepository } from "../../../domain/repositories/TestRepository";
import { ImageRepository } from "../../../domain/repositories/ImageRepository";

import { UserController } from "../../../application/controllers/UserController";
import { TicketController } from "../../../application/controllers/TicketController";
import { CommentController } from "../../../application/controllers/CommentController";
import { SprintController } from "../../../application/controllers/SprintController";
import { TestController } from "../../../application/controllers/TestController";
import { ImageController } from "../../../application/controllers/ImageController";

import { UserRouter } from "./UserRouter";
import { TicketRouter } from "./TicketRouter";
import { CommentRouter } from "./CommentRouter";
import { SprintRouter } from "./SprintRouter";
import { TestRouter } from "./TestRouter";
import { ImageRouter } from "./ImageRouter";


export class RouteFactory {
  constructor(private readonly dataSource: DataSource) {}

  public createApiPlugin(): FastifyPluginAsync {
    return async (fastify: FastifyInstance) => {
      await fastify.register(this.createUserPlugin(), { prefix: "/users" });
      await fastify.register(this.createTicketPlugin(), { prefix: "/tickets" });
      await fastify.register(this.createCommentPlugin(), { prefix: "/comments" });
      await fastify.register(this.createSprintPlugin(), { prefix: "/sprints" });
      await fastify.register(this.createTestPlugin(), { prefix: "/tests" });
    await fastify.register(this.createImagePlugin(), { prefix: "/images" });
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

  private createTestPlugin(): FastifyPluginAsync {
    const repository = new TestRepository(this.dataSource.getRepository(Test));
    const controller = new TestController(repository);
    const router = new TestRouter(controller);
    return router.plugin;
  }

  private createImagePlugin(): FastifyPluginAsync {
    const repository = new ImageRepository(this.dataSource.getRepository(Image));
    const controller = new ImageController(repository);
    const router = new ImageRouter(controller);
    return router.plugin;
  }
}