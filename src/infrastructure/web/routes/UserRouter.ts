import { FastifyInstance } from "fastify";
import { UserController } from "../../../application/controllers/UserController";
import { User } from "../../../domain/entities/User";
import { AbstractRouter } from "./AbstractRouter";

export class UserRouter extends AbstractRouter<User> {
  constructor(controller: UserController) {
    super(controller);
  }

  protected get userController(): UserController {
    return this.controller as UserController;
  }

  protected async addCustomRoutes(fastify: FastifyInstance): Promise<void> {
    fastify.get("/email/:email", this.userController.getByEmail.bind(this.userController));
  }
}