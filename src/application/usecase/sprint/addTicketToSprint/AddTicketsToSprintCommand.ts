import { Command } from "../../../common/usecase/Command";
import { InvalidCommandException } from "../../../common/exceptions/InvalidCommandException";

/**
 * Command to add tickets to a sprint
 */
export class AddTicketsToSprintCommand implements Command {
  constructor(
    public readonly sprintId: number,
    public readonly ticketIds: number[]
  ) {}

  validate(): void {
    if (!this.sprintId || this.sprintId <= 0) {
      throw new InvalidCommandException('Sprint ID must be a positive number');
    }

    if (!Array.isArray(this.ticketIds) || this.ticketIds.length === 0) {
      throw new InvalidCommandException('Ticket IDs must be a non-empty array');
    }

    if (this.ticketIds.some(id => !id || id <= 0)) {
      throw new InvalidCommandException('All ticket IDs must be positive numbers');
    }
  }
}