import { Command } from "../../../common/usecase/Command";
import { InvalidCommandException } from "../../../common/exceptions/InvalidCommandException";

/**
 * Command to assign or unassign a ticket to a user
 */
export class AssignTicketToUserCommand implements Command {
  constructor(
    public readonly ticketId: number,
    public readonly userId: number | null
  ) {}

  validate(): void {
    if (!this.ticketId || this.ticketId <= 0) {
      throw new InvalidCommandException('Ticket ID must be a positive number');
    }

    if (this.userId !== null && this.userId <= 0) {
      throw new InvalidCommandException('User ID must be a positive number or null');
    }
  }
}