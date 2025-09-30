import { FastifyInstance } from "fastify";
import { UserController } from "../../../application/controllers/UserController";
import { User } from "../../../domain/entities/User";
import { AbstractRouter } from "./AbstractRouter";
import { authMiddleware, checkOwnership } from "../middlewares/AuthMiddleware";

export class UserRouter extends AbstractRouter<User> {
  constructor(controller: UserController) {
    super(controller);
  }

  protected get userController(): UserController {
    return this.controller as UserController;
  }

  protected async addCustomRoutes(fastify: FastifyInstance): Promise<void> {
    // POST /users/register - Public route
    fastify.post(
      "/register", 
      this.userController.register.bind(this.userController)
    );
    
    // POST /users/login - Public route
    fastify.post(
      "/login", 
      this.userController.login.bind(this.userController)
    );
    
    // POST /users/refresh-token - Public route
    fastify.post(
      "/refresh-token", 
      this.userController.refreshToken.bind(this.userController)
    );

    // GET /users/dashboard - Get user dashboard
    fastify.get(
      "/dashboard",
      { onRequest: [authMiddleware] },
      this.userController.getDashboard.bind(this.userController)
    );
    
    // GET /users/email/:email - Protected by authMiddleware
    fastify.get(
      "/email/:email",
      { onRequest: [authMiddleware] },
      this.userController.getByEmail.bind(this.userController)
    );

    // PATCH /users/:id/password - Protected + ownership check
    fastify.patch(
      "/:id/password",
      { onRequest: [authMiddleware, checkOwnership] },
      this.userController.updatePassword.bind(this.userController)
    );
  }
}