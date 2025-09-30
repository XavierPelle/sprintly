import { Command } from "../../../common/usecase/Command";
import { InvalidCommandException } from "../../../common/exceptions/InvalidCommandException";

/**
 * Command to close a sprint and handle incomplete tickets
 */
export class CloseSprintCommand implements Command {
  constructor(
    public readonly sprintId: number,
    public readonly moveIncompleteTo?: number,
    public readonly removeIncomplete: boolean = false
  ) {}

  validate(): void {
    if (!this.sprintId || this.sprintId <= 0) {
      throw new InvalidCommandException('Sprint ID must be a positive number');
    }

    if (this.moveIncompleteTo !== undefined && this.moveIncompleteTo <= 0) {
      throw new InvalidCommandException('Target sprint ID must be a positive number');
    }

    if (this.moveIncompleteTo && this.removeIncomplete) {
      throw new InvalidCommandException(
        'Cannot both move and remove incomplete tickets. Choose one option.'
      );
    }

    if (this.moveIncompleteTo === this.sprintId) {
      throw new InvalidCommandException(
        'Target sprint cannot be the same as the sprint being closed'
      );
    }
  }
}