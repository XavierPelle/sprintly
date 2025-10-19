import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { DataSource } from "typeorm";

// Entities
import { User } from "../../../domain/entities/User";
import { Ticket } from "../../../domain/entities/Ticket";
import { Comment } from "../../../domain/entities/Comment";
import { Sprint } from "../../../domain/entities/Sprint";
import { Test } from "../../../domain/entities/Test";
import { Image } from "../../../domain/entities/Image";
import { Tag } from "../../../domain/entities/Tag";

// Repositories
import { UserRepository } from "../../../domain/repositories/UserRepository";
import { TicketRepository } from "../../../domain/repositories/TicketRepository";
import { CommentRepository } from "../../../domain/repositories/CommentRepository";
import { SprintRepository } from "../../../domain/repositories/SprintRepository";
import { TestRepository } from "../../../domain/repositories/TestRepository";
import { ImageRepository } from "../../../domain/repositories/ImageRepository";
import { TagRepository } from "../../../domain/repositories/TagRepository";

// Controllers
import { UserController } from "../../../application/controllers/UserController";
import { TicketController } from "../../../application/controllers/TicketController";
import { CommentController } from "../../../application/controllers/CommentController";
import { SprintController } from "../../../application/controllers/SprintController";
import { TestController } from "../../../application/controllers/TestController";
import { ImageController } from "../../../application/controllers/ImageController";
import { DashboardController } from "../../../application/controllers/DashboardController";

// Routers
import { UserRouter } from "./UserRouter";
import { TicketRouter } from "./TicketRouter";
import { CommentRouter } from "./CommentRouter";
import { SprintRouter } from "./SprintRouter";
import { TestRouter } from "./TestRouter";
import { ImageRouter } from "./ImageRouter";
import { DashboardRouter } from "./DashboardRouter";

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
            await fastify.register(this.createDashboardPlugin(), { prefix: "/dashboard" });
        };
    }

    private createUserPlugin(): FastifyPluginAsync {
        const userRepository = new UserRepository(this.dataSource.getRepository(User));
        const ticketRepository = new TicketRepository(this.dataSource.getRepository(Ticket));
        const sprintRepository = new SprintRepository(this.dataSource.getRepository(Sprint));
        const testRepository = new TestRepository(this.dataSource.getRepository(Test));
        const commentRepository = new CommentRepository(this.dataSource.getRepository(Comment));

        const controller = new UserController(
            userRepository,
            ticketRepository,
            sprintRepository,
            testRepository,
            commentRepository
        );

        const router = new UserRouter(controller);
        return router.plugin;
    }

    private createTicketPlugin(): FastifyPluginAsync {
        const ticketRepository = new TicketRepository(this.dataSource.getRepository(Ticket));
        const userRepository = new UserRepository(this.dataSource.getRepository(User));
        const sprintRepository = new SprintRepository(this.dataSource.getRepository(Sprint));
        const tagRepository = new TagRepository(this.dataSource.getRepository(Tag));

        const controller = new TicketController(
            ticketRepository,
            userRepository,
            sprintRepository,
            tagRepository
        );

        const router = new TicketRouter(controller);
        return router.plugin;
    }

    private createCommentPlugin(): FastifyPluginAsync {
        const commentRepository = new CommentRepository(this.dataSource.getRepository(Comment));
        const ticketRepository = new TicketRepository(this.dataSource.getRepository(Ticket));
        const userRepository = new UserRepository(this.dataSource.getRepository(User));

        const controller = new CommentController(
            commentRepository,
            ticketRepository,
            userRepository
        );

        const router = new CommentRouter(controller);
        return router.plugin;
    }

    private createSprintPlugin(): FastifyPluginAsync {
        const sprintRepository = new SprintRepository(this.dataSource.getRepository(Sprint));
        const ticketRepository = new TicketRepository(this.dataSource.getRepository(Ticket));

        const controller = new SprintController(
            sprintRepository,
            ticketRepository
        );

        const router = new SprintRouter(controller);
        return router.plugin;
    }

    private createTestPlugin(): FastifyPluginAsync {
        const testRepository = new TestRepository(this.dataSource.getRepository(Test));
        const ticketRepository = new TicketRepository(this.dataSource.getRepository(Ticket));
        const userRepository = new UserRepository(this.dataSource.getRepository(User));
        const imageRepository = new ImageRepository(this.dataSource.getRepository(Image));

        const controller = new TestController(
            testRepository,
            ticketRepository,
            userRepository,
            imageRepository
        );

        const router = new TestRouter(controller);
        return router.plugin;
    }

    private createImagePlugin(): FastifyPluginAsync {
        const imageRepository = new ImageRepository(this.dataSource.getRepository(Image));
        const ticketRepository = new TicketRepository(this.dataSource.getRepository(Ticket));
        const testRepository = new TestRepository(this.dataSource.getRepository(Test));
        const userRepository = new UserRepository(this.dataSource.getRepository(User));

        const controller = new ImageController(
            imageRepository,
            ticketRepository,
            testRepository,
            userRepository
        );

        const router = new ImageRouter(controller);
        return router.plugin;
    }

    private createDashboardPlugin(): FastifyPluginAsync {
        const ticketRepository = new TicketRepository(this.dataSource.getRepository(Ticket));
        const userRepository = new UserRepository(this.dataSource.getRepository(User));
        const sprintRepository = new SprintRepository(this.dataSource.getRepository(Sprint));
        const testRepository = new TestRepository(this.dataSource.getRepository(Test));
        const commentRepository = new CommentRepository(this.dataSource.getRepository(Comment));

        const controller = new DashboardController(
            ticketRepository,
            userRepository,
            sprintRepository,
            testRepository,
            commentRepository
        );

        const router = new DashboardRouter(controller);
        return router.plugin;
    }
}
