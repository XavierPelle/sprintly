import { Command } from "../../../common/usecase/Command";
import { InvalidCommandException } from "../../../common/exceptions/InvalidCommandException";
import { TicketStatus } from "../../../../domain/enums/TicketStatus";
import { TicketType } from "../../../../domain/enums/TicketType";

/**
 * Command to search tickets with advanced filters
 */
export class SearchTicketsCommand implements Command {
  constructor(
    public readonly query?: string,
    public readonly status?: TicketStatus,
    public readonly type?: TicketType,
    public readonly assigneeId?: number,
    public readonly creatorId?: number,
    public readonly sprintId?: number,
    public readonly minPoints?: number,
    public readonly maxPoints?: number,
    public readonly sortBy: 'createdAt' | 'updatedAt' | 'difficultyPoints' | 'key' = 'createdAt',
    public readonly sortOrder: 'ASC' | 'DESC' = 'DESC',
    public readonly page: number = 1,
    public readonly limit: number = 20
  ) {}

  validate(): void {
    if (this.query !== undefined && this.query.length > 200) {
      throw new InvalidCommandException('Search query must not exceed 200 characters');
    }

    if (this.status !== undefined) {
      const validStatuses = Object.values(TicketStatus);
      if (!validStatuses.includes(this.status)) {
        throw new InvalidCommandException(
          `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        );
      }
    }

    if (this.type !== undefined) {
      const validTypes = Object.values(TicketType);
      if (!validTypes.includes(this.type)) {
        throw new InvalidCommandException(
          `Invalid type. Must be one of: ${validTypes.join(', ')}`
        );
      }
    }

    if (this.assigneeId !== undefined && this.assigneeId <= 0) {
      throw new InvalidCommandException('Assignee ID must be a positive number');
    }

    if (this.creatorId !== undefined && this.creatorId <= 0) {
      throw new InvalidCommandException('Creator ID must be a positive number');
    }

    if (this.sprintId !== undefined && this.sprintId <= 0) {
      throw new InvalidCommandException('Sprint ID must be a positive number');
    }

    if (this.minPoints !== undefined && this.minPoints < 0) {
      throw new InvalidCommandException('Min points must be non-negative');
    }

    if (this.maxPoints !== undefined && this.maxPoints < 0) {
      throw new InvalidCommandException('Max points must be non-negative');
    }

    if (this.minPoints !== undefined && this.maxPoints !== undefined && this.minPoints > this.maxPoints) {
      throw new InvalidCommandException('Min points must be less than or equal to max points');
    }

    const validSortFields = ['createdAt', 'updatedAt', 'difficultyPoints', 'key'];
    if (!validSortFields.includes(this.sortBy)) {
      throw new InvalidCommandException(
        `Invalid sort field. Must be one of: ${validSortFields.join(', ')}`
      );
    }

    if (!['ASC', 'DESC'].includes(this.sortOrder)) {
      throw new InvalidCommandException('Sort order must be ASC or DESC');
    }

    if (this.page <= 0) {
      throw new InvalidCommandException('Page must be a positive number');
    }

    if (this.limit <= 0 || this.limit > 1000) {
      throw new InvalidCommandException('Limit must be between 1 and 1000');
    }
  }
}
