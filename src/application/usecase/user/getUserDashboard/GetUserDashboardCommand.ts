import { Command } from "../../../common/usecase/Command";
import { InvalidCommandException } from "../../../common/exceptions/InvalidCommandException";

/**
 * Command to get personalized user dashboard
 */
export class GetUserDashboardCommand implements Command {
  constructor(public readonly userId: number) {}

  validate(): void {
    if (!this.userId || this.userId <= 0) {
      throw new InvalidCommandException('User ID must be a positive number');
    }
  }
}