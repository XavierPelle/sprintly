import { FastifyReply, FastifyRequest } from "fastify";
import { User } from "../../domain/entities/User";
import { UserRepository } from "../../domain/repositories/UserRepository";
import { AbstractController } from "./AbstractController";
import { RegisterUserUseCase } from "../usecase/user/register/RegisterUserUseCase";
import { LoginUserUseCase } from "../usecase/user/login/LoginUserUseCase";
import { UpdatePasswordUseCase } from "../usecase/user/updatePassword/UpdatePasswordUseCase";
import { RefreshTokenUseCase } from "../usecase/user/refreshToken/RefreshTokenUseCase";
import { RegisterUserCommand } from "../usecase/user/register/RegisterUserCommand";
import { LoginUserCommand } from "../usecase/user/login/LoginUserCommand";
import { UpdatePasswordCommand } from "../usecase/user/updatePassword/UpdatePasswordCommand";
import { RefreshTokenCommand } from "../usecase/user/refreshToken/RefreshTokenCommand";

export class UserController extends AbstractController<User> {
  constructor(repository: UserRepository) {
    super(repository);
  }

  protected get userRepository(): UserRepository {
    return this.repository as UserRepository;
  }

  /**
   * GET /email/:email - Get user by email
   */
  async getByEmail(
    request: FastifyRequest<{ Params: { email: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { email } = request.params;
      const user = await this.userRepository.findByEmail(email);

      if (!user) {
        return reply.status(404).send({ message: "User not found" });
      }

      reply.send(user);
    } catch (error) {
      throw error;
    }
  }

  /**
   * POST /register - Register a new user
   */
  async register(
    request: FastifyRequest<{
      Body: {
        firstName: string;
        lastName: string;
        email: string;
        password: string;
      };
    }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { firstName, lastName, email, password } = request.body;

      const useCase = new RegisterUserUseCase(this.userRepository);
      const command = new RegisterUserCommand(firstName, lastName, email, password);
      const response = await useCase.execute(command);

      if (!response.isSuccess()) {
        return reply.status(response.getStatusCode()).send(response.toJSON());
      }

      reply.status(201).send(response.getData());
    } catch (error) {
      throw error;
    }
  }

  /**
   * POST /login - Authenticate user
   */
  async login(
    request: FastifyRequest<{
      Body: {
        email: string;
        password: string;
      };
    }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { email, password } = request.body;

      const useCase = new LoginUserUseCase(this.userRepository);
      const command = new LoginUserCommand(email, password);
      const response = await useCase.execute(command);

      if (!response.isSuccess()) {
        return reply.status(response.getStatusCode()).send(response.toJSON());
      }

      reply.status(200).send(response.getData());
    } catch (error) {
      throw error;
    }
  }

  /**
   * PATCH /:id/password - Update user password
   */
  async updatePassword(
    request: FastifyRequest<{
      Params: { id: string };
      Body: {
        currentPassword: string;
        newPassword: string;
        confirmPassword: string;
      };
    }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const userId = Number(request.params.id);
      const { currentPassword, newPassword, confirmPassword } = request.body;

      const useCase = new UpdatePasswordUseCase(this.userRepository);
      const command = new UpdatePasswordCommand(
        userId,
        currentPassword,
        newPassword,
        confirmPassword
      );
      const response = await useCase.execute(command);

      if (!response.isSuccess()) {
        return reply.status(response.getStatusCode()).send(response.toJSON());
      }

      reply.status(200).send(response.getData());
    } catch (error) {
      throw error;
    }
  }

  /**
   * POST /refresh-token - Refresh access token
   */
  async refreshToken(
    request: FastifyRequest<{
      Body: {
        refreshToken: string;
      };
    }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { refreshToken } = request.body;

      const useCase = new RefreshTokenUseCase(this.userRepository);
      const command = new RefreshTokenCommand(refreshToken);
      const response = await useCase.execute(command);

      if (!response.isSuccess()) {
        return reply.status(response.getStatusCode()).send(response.toJSON());
      }

      reply.status(200).send(response.getData());
    } catch (error) {
      throw error;
    }
  }
}