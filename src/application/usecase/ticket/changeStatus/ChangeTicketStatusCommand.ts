import { Command } from "../../../common/usecase/Command";
import { InvalidCommandException } from "../../../common/exceptions/InvalidCommandException";
import { TicketStatus } from "../../../../domain/enums/TicketStatus";

/**
 * Command to change ticket status
 */
export class ChangeTicketStatusCommand implements Command {
  constructor(
    public readonly ticketId: number,
    public readonly newStatus: TicketStatus
  ) {}

  validate(): void {
    if (!this.ticketId || this.ticketId <= 0) {
      throw new InvalidCommandException('Ticket ID must be a positive number');
    }

    if (!this.newStatus) {
      throw new InvalidCommandException('New status is required');
    }

    const validStatuses = Object.values(TicketStatus);
    if (!validStatuses.includes(this.newStatus)) {
      throw new InvalidCommandException(
        `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      );
    }
  }
}