import { Command } from "../../../common/usecase/Command";
import { InvalidCommandException } from "../../../common/exceptions/InvalidCommandException";


export class RegisterUserCommand implements Command {
  constructor(
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly email: string,
    public readonly password: string
  ) {}

  validate(): void {
    if (!this.firstName || this.firstName.trim().length === 0) {
      throw new InvalidCommandException('First name is required');
    }

    if (this.firstName.length < 2) {
      throw new InvalidCommandException('First name must be at least 2 characters');
    }

    if (!this.lastName || this.lastName.trim().length === 0) {
      throw new InvalidCommandException('Last name is required');
    }

    if (this.lastName.length < 2) {
      throw new InvalidCommandException('Last name must be at least 2 characters');
    }

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

    if (this.password.length < 8) {
      throw new InvalidCommandException('Password must be at least 8 characters');
    }

    const hasUpperCase = /[A-Z]/.test(this.password);
    const hasLowerCase = /[a-z]/.test(this.password);
    const hasNumber = /[0-9]/.test(this.password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(this.password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      throw new InvalidCommandException(
        'Password must contain at least one uppercase letter, one lowercase letter, and one number, and one special character'
      );
    }
  }
}