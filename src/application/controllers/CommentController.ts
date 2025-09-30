import { FastifyReply, FastifyRequest } from "fastify";
import { Comment } from "../../domain/entities/Comment";
import { CommentRepository } from "../../domain/repositories/CommentRepository";
import { TicketRepository } from "../../domain/repositories/TicketRepository";
import { UserRepository } from "../../domain/repositories/UserRepository";
import { AbstractController } from "./AbstractController";
import { CreateCommentOnTicketUseCase } from "../usecase/comment/createComment/CreateCommentOnTicketUseCase";
import { CreateCommentOnTicketCommand } from "../usecase/comment/createComment/CreateCommentOnTicketCommand";

export class CommentController extends AbstractController<Comment> {
  constructor(
    repository: CommentRepository,
    private readonly ticketRepository: TicketRepository,
    private readonly userRepository: UserRepository
  ) {
    super(repository);
  }

  protected get CommentRepository(): CommentRepository {
    return this.repository as CommentRepository;
  }

  /**
   * POST /ticket/:ticketId - Create comment on ticket
   */
  async createOnTicket(
    request: FastifyRequest<{
      Params: { ticketId: string };
      Body: { description: string };
    }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const ticketId = Number(request.params.ticketId);
      const { description } = request.body;
      const userId = request.user!.userId; // From auth middleware

      const useCase = new CreateCommentOnTicketUseCase(
        this.CommentRepository,
        this.ticketRepository,
        this.userRepository
      );

      const command = new CreateCommentOnTicketCommand(
        ticketId,
        userId,
        description
      );
      const response = await useCase.execute(command);

      if (!response.isSuccess()) {
        return reply.status(response.getStatusCode()).send(response.toJSON());
      }

      reply.status(201).send(response.getData());
    } catch (error) {
      throw error;
    }
  }
}