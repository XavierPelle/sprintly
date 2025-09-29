import { FastifyReply, FastifyRequest } from "fastify";
import { User } from "../../domain/entities/User";
import { UserRepository } from "../../domain/repositories/UserRepository";
import { AbstractController } from "./AbstractController";

export class UserController extends AbstractController<User> {
  constructor(repository: UserRepository) {
    super(repository);
  }

  protected get userRepository(): UserRepository {
    return this.repository as UserRepository;
  }

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
}