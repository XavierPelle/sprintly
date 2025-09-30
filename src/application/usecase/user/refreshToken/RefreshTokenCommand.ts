import { Command } from "../../../common/usecase/Command";
import { InvalidCommandException } from "../../../common/exceptions/InvalidCommandException";

/**
 * Command to refresh access token
 */
export class RefreshTokenCommand implements Command {
  constructor(public readonly refreshToken: string) {}

  validate(): void {
    if (!this.refreshToken || this.refreshToken.trim().length === 0) {
      throw new InvalidCommandException('Refresh token is required');
    }
  }
}