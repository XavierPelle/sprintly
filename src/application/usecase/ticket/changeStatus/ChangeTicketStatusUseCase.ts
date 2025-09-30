import { AbstractUseCase } from "../../../common/usecase/AbstractUseCase";
import { ChangeTicketStatusCommand } from "./ChangeTicketStatusCommand";
import { ChangeTicketStatusResponse } from "./ChangeTicketStatusResponse";
import { TicketRepository } from "../../../../domain/repositories/TicketRepository";
import { ApplicationException } from "../../../common/exceptions/ApplicationException";
import { TicketStatus } from "../../../../domain/enums/TicketStatus";

/**
 * Use case to change ticket status with workflow validation
 */
export class ChangeTicketStatusUseCase extends AbstractUseCase<
  ChangeTicketStatusCommand,
  ChangeTicketStatusResponse
> {
  protected static commandClass = ChangeTicketStatusCommand;

  private readonly VALID_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
    [TicketStatus.TODO]: [TicketStatus.IN_PROGRESS],
    [TicketStatus.IN_PROGRESS]: [
      TicketStatus.TODO, 
      TicketStatus.REVIEW
    ],
    [TicketStatus.REVIEW]: [
      TicketStatus.IN_PROGRESS, 
      TicketStatus.CHANGE_REQUEST, 
      TicketStatus.TEST
    ],
    [TicketStatus.CHANGE_REQUEST]: [TicketStatus.IN_PROGRESS],
    [TicketStatus.TEST]: [
      TicketStatus.TEST_OK, 
      TicketStatus.TEST_KO
    ],
    [TicketStatus.TEST_KO]: [TicketStatus.IN_PROGRESS],
    [TicketStatus.TEST_OK]: [TicketStatus.PRODUCTION],
    [TicketStatus.PRODUCTION]: []
  };

  constructor(private readonly ticketRepository: TicketRepository) {
    super();
  }

  protected async doExecute(
    command: ChangeTicketStatusCommand
  ): Promise<Partial<ChangeTicketStatusResponse>> {
    
    const ticket = await this.ticketRepository.findById(command.ticketId);
    if (!ticket) {
      throw new ApplicationException('TICKET_NOT_FOUND', { 
        ticketId: command.ticketId 
      });
    }

    const currentStatus = ticket.status;
    const newStatus = command.newStatus;

    if (currentStatus === newStatus) {
      throw new ApplicationException('TICKET_ALREADY_IN_STATUS', {
        ticketId: command.ticketId,
        status: newStatus
      });
    }

    const validTransitions = this.VALID_TRANSITIONS[currentStatus];
    if (!validTransitions.includes(newStatus)) {
      throw new ApplicationException('INVALID_STATUS_TRANSITION', {
        ticketId: command.ticketId,
        currentStatus,
        newStatus,
        allowedTransitions: validTransitions
      });
    }

    await this.ticketRepository.update(command.ticketId, {
      status: newStatus
    });

    return {
      ticketId: command.ticketId,
      ticketKey: ticket.key,
      previousStatus: currentStatus,
      newStatus,
      message: `Ticket status changed from ${currentStatus} to ${newStatus}`
    };
  }
}