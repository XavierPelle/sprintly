import { FastifyInstance } from "fastify";
import { UserController } from "../../../application/controllers/UserController";
import { User } from "../../../domain/entities/User";
import { AbstractRouter } from "./AbstractRouter";
import { authMiddleware, checkOwnership } from "../middlewares/authMiddleware";

export class UserRouter extends AbstractRouter<User> {
  constructor(controller: UserController) {
    super(controller);
  }

  protected get userController(): UserController {
    return this.controller as UserController;
  }

  protected async addCustomRoutes(fastify: FastifyInstance): Promise<void> {

    fastify.post(
      "/register", 
      this.userController.register.bind(this.userController)
    );
    
    fastify.post(
      "/login", 
      this.userController.login.bind(this.userController)
    );
    
    fastify.post(
      "/refresh-token", 
      this.userController.refreshToken.bind(this.userController)
    );
    
    // GET /users/email/:email - Protégé par authMiddleware
    fastify.get(
      "/email/:email",
      { 
        onRequest: [authMiddleware] 
      },
      this.userController.getByEmail.bind(this.userController)
    );

    // PATCH /users/:id/password - Protégé + vérification ownership
    fastify.patch(
      "/:id/password",
      { 
        onRequest: [authMiddleware, checkOwnership] 
      },
      this.userController.updatePassword.bind(this.userController)
    );
  }
}