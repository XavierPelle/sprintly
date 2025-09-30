import { Command } from "../../../common/usecase/Command";
import { InvalidCommandException } from "../../../common/exceptions/InvalidCommandException";

/**
 * Command to validate or reject a test
 */
export class ValidateTestCommand implements Command {
  constructor(
    public readonly testId: number,
    public readonly isValidated: boolean,
    public readonly validatedBy: number 
  ) {}

  validate(): void {
    if (!this.testId || this.testId <= 0) {
      throw new InvalidCommandException('Test ID must be a positive number');
    }

    if (typeof this.isValidated !== 'boolean') {
      throw new InvalidCommandException('isValidated must be a boolean');
    }

    if (!this.validatedBy || this.validatedBy <= 0) {
      throw new InvalidCommandException('ValidatedBy user ID must be a positive number');
    }
  }
}