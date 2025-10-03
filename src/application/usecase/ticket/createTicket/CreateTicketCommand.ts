import { Command } from "../../../common/usecase/Command";
import { InvalidCommandException } from "../../../common/exceptions/InvalidCommandException";
import { TicketType } from "../../../../domain/enums/TicketType";
import { TicketPriority } from "../../../../domain/enums/TicketPriority";

/**
 * Command to create a new ticket with auto-generated key
 */
export class CreateTicketCommand implements Command {
  constructor(
    public readonly title: string,
    public readonly description: string,
    public readonly type: TicketType,
    public readonly difficultyPoints: number,
    public readonly creatorId: number,
    public readonly priority: TicketPriority,
    public readonly assignee?: number,
    public readonly sprintId?: number,
    public readonly projectPrefix: string = "PROJ",
  ) {}

  validate(): void {
    if (!this.title || this.title.trim().length === 0) {
      throw new InvalidCommandException('Title is required');
    }

    if (this.title.length < 3) {
      throw new InvalidCommandException('Title must be at least 3 characters');
    }

    if (this.title.length > 200) {
      throw new InvalidCommandException('Title must not exceed 200 characters');
    }

    if (!this.description || this.description.trim().length === 0) {
      throw new InvalidCommandException('Description is required');
    }

    if (this.description.length < 10) {
      throw new InvalidCommandException('Description must be at least 10 characters');
    }

    if (this.description.length > 10000) {
      throw new InvalidCommandException('Description must not exceed 10000 characters');
    }

    if (!this.type) {
      throw new InvalidCommandException('Type is required');
    }

    const validTypes = Object.values(TicketType);
    if (!validTypes.includes(this.type)) {
      throw new InvalidCommandException(
        `Invalid type. Must be one of: ${validTypes.join(', ')}`
      );
    }

    if (this.difficultyPoints < 0) {
      throw new InvalidCommandException('Difficulty points must be non-negative');
    }

    if (this.difficultyPoints > 100) {
      throw new InvalidCommandException('Difficulty points must not exceed 100');
    }

    if (!this.creatorId || this.creatorId <= 0) {
      throw new InvalidCommandException('Creator ID must be a positive number');
    }

    if (this.assignee !== undefined && this.assignee <= 0) {
      throw new InvalidCommandException('Assignee ID must be a positive number or undefined');
    }

    if (this.sprintId !== undefined && this.sprintId <= 0) {
      throw new InvalidCommandException('Sprint ID must be a positive number or undefined');
    }

    if (!this.projectPrefix || this.projectPrefix.trim().length === 0) {
      throw new InvalidCommandException('Project prefix is required');
    }

    if (!/^[A-Z]{2,10}$/.test(this.projectPrefix)) {
      throw new InvalidCommandException('Project prefix must be 2-10 uppercase letters');
    }
  }
}