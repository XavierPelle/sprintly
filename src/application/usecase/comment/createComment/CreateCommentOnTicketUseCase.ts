import { AbstractUseCase } from "../../../common/usecase/AbstractUseCase";
import { CreateCommentOnTicketCommand } from "./CreateCommentOnTicketCommand";
import { CreateCommentOnTicketResponse } from "./CreateCommentOnTicketResponse";
import { CommentRepository } from "../../../../domain/repositories/CommentRepository";
import { TicketRepository } from "../../../../domain/repositories/TicketRepository";
import { UserRepository } from "../../../../domain/repositories/UserRepository";
import { ApplicationException } from "../../../common/exceptions/ApplicationException";

/**
 * Use case to create a comment on a ticket
 */
export class CreateCommentOnTicketUseCase extends AbstractUseCase<
  CreateCommentOnTicketCommand,
  CreateCommentOnTicketResponse
> {
  protected static commandClass = CreateCommentOnTicketCommand;

  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly ticketRepository: TicketRepository,
    private readonly userRepository: UserRepository
  ) {
    super();
  }

  protected async doExecute(
    command: CreateCommentOnTicketCommand
  ): Promise<Partial<CreateCommentOnTicketResponse>> {
    
    const ticket = await this.ticketRepository.findById(command.ticketId);
    if (!ticket) {
      throw new ApplicationException('TICKET_NOT_FOUND', { 
        ticketId: command.ticketId 
      });
    }

    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new ApplicationException('USER_NOT_FOUND', { 
        userId: command.userId 
      });
    }

    const comment = await this.commentRepository.create({
      description: command.description.trim(),
      user: { id: command.userId } as any,
      ticket: { id: command.ticketId } as any
    });

    return {
      id: comment.id,
      ticketId: command.ticketId,
      ticketKey: ticket.key,
      userId: command.userId,
      userName: `${user.firstName} ${user.lastName}`,
      description: comment.description,
      createdAt: comment.createdAt,
      message: 'Comment created successfully'
    };
  }
}