import { Command } from "../../../common/usecase/Command";
import { InvalidCommandException } from "../../../common/exceptions/InvalidCommandException";

/**
 * Command to get ticket details with all relations
 */
export class GetTicketDetailsCommand implements Command {
  constructor(public readonly ticketId: number) {}

  validate(): void {
    if (!this.ticketId || this.ticketId <= 0) {
      throw new InvalidCommandException('Ticket ID must be a positive number');
    }
  }
}