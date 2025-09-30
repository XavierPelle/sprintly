import { Command } from "../../../common/usecase/Command";
import { InvalidCommandException } from "../../../common/exceptions/InvalidCommandException";

/**
 * Command to create a test for a ticket
 */
export class CreateTestForTicketCommand implements Command {
  constructor(
    public readonly ticketId: number,
    public readonly userId: number,
    public readonly description: string
  ) {}

  validate(): void {
    if (!this.ticketId || this.ticketId <= 0) {
      throw new InvalidCommandException('Ticket ID must be a positive number');
    }

    if (!this.userId || this.userId <= 0) {
      throw new InvalidCommandException('User ID must be a positive number');
    }

    if (!this.description || this.description.trim().length === 0) {
      throw new InvalidCommandException('Test description is required');
    }

    if (this.description.trim().length < 10) {
      throw new InvalidCommandException('Test description must be at least 10 characters');
    }

    if (this.description.length > 10000) {
      throw new InvalidCommandException('Test description must not exceed 10000 characters');
    }
  }
}