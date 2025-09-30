import { Command } from "../../../common/usecase/Command";
import { InvalidCommandException } from "../../../common/exceptions/InvalidCommandException";

/**
 * Command to authenticate a user
 */
export class LoginUserCommand implements Command {
  constructor(
    public readonly email: string,
    public readonly password: string
  ) {}

  validate(): void {
    if (!this.email || this.email.trim().length === 0) {
      throw new InvalidCommandException('Email is required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      throw new InvalidCommandException('Invalid email format');
    }

    if (!this.password || this.password.length === 0) {
      throw new InvalidCommandException('Password is required');
    }
  }
}