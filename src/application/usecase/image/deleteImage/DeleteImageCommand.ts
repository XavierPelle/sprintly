import { Command } from "../../../common/usecase/Command";
import { InvalidCommandException } from "../../../common/exceptions/InvalidCommandException";

/**
 * Command to delete an image from database and filesystem
 */
export class DeleteImageCommand implements Command {
  constructor(public readonly imageId: number) {}

  validate(): void {
    if (!this.imageId || this.imageId <= 0) {
      throw new InvalidCommandException('Image ID must be a positive number');
    }
  }
}