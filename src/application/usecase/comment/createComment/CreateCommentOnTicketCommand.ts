import { Command } from "../../../common/usecase/Command";
import { InvalidCommandException } from "../../../common/exceptions/InvalidCommandException";

/**
 * Command to create a comment on a ticket
 */
export class CreateCommentOnTicketCommand implements Command {
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
      throw new InvalidCommandException('Comment description is required');
    }

    if (this.description.trim().length < 1) {
      throw new InvalidCommandException('Comment must be at least 1 character');
    }

    if (this.description.length > 5000) {
      throw new InvalidCommandException('Comment must not exceed 5000 characters');
    }
  }
}