import { Command } from "../../../common/usecase/Command";
import { InvalidCommandException } from "../../../common/exceptions/InvalidCommandException";

/**
 * Command to get sprint burndown chart data
 */
export class GetSprintBurndownCommand implements Command {
  constructor(public readonly sprintId: number) {}

  validate(): void {
    if (!this.sprintId || this.sprintId <= 0) {
      throw new InvalidCommandException('Sprint ID must be a positive number');
    }
  }
}