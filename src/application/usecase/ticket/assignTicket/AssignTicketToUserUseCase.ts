import { AbstractUseCase } from "../../../common/usecase/AbstractUseCase";
import { AssignTicketToUserCommand } from "./AssignTicketToUserCommand";
import { AssignTicketToUserResponse } from "./AssignTicketToUserResponse";
import { TicketRepository } from "../../../../domain/repositories/TicketRepository";
import { UserRepository } from "../../../../domain/repositories/UserRepository";
import { ApplicationException } from "../../../common/exceptions/ApplicationException";

/**
 * Use case to assign or unassign a ticket to a user
 */
export class AssignTicketToUserUseCase extends AbstractUseCase<
  AssignTicketToUserCommand,
  AssignTicketToUserResponse
> {
  protected static commandClass = AssignTicketToUserCommand;

  constructor(
    private readonly ticketRepository: TicketRepository,
    private readonly userRepository: UserRepository
  ) {
    super();
  }

  protected async doExecute(
    command: AssignTicketToUserCommand
  ): Promise<Partial<AssignTicketToUserResponse>> {
    
    const ticket = await this.ticketRepository.findById(command.ticketId);
    if (!ticket) {
      throw new ApplicationException('TICKET_NOT_FOUND', { 
        ticketId: command.ticketId 
      });
    }

    let assigneeName: string | null = null;

    if (command.userId !== null) {
      const user = await this.userRepository.findById(command.userId);
      if (!user) {
        throw new ApplicationException('USER_NOT_FOUND', { 
          userId: command.userId 
        });
      }
      assigneeName = `${user.firstName} ${user.lastName}`;

      await this.ticketRepository.update(command.ticketId, {
        assignee: { id: command.userId } as any
      });
    } else {
      await this.ticketRepository.update(command.ticketId, {
        assignee: null as any
      });
    }

    return {
      ticketId: command.ticketId,
      ticketKey: ticket.key,
      assignee: command.userId,
      assigneeName,
      message: command.userId 
        ? `Ticket assigned to ${assigneeName}` 
        : 'Ticket unassigned'
    };
  }
}