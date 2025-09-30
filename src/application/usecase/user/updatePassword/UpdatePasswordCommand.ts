import { Command } from "../../../common/usecase/Command";
import { InvalidCommandException } from "../../../common/exceptions/InvalidCommandException";

/**
 * Command to update user password
 */
export class UpdatePasswordCommand implements Command {
  constructor(
    public readonly userId: number,
    public readonly currentPassword: string,
    public readonly newPassword: string,
    public readonly confirmPassword: string
  ) {}

  validate(): void {
    if (!this.userId || this.userId <= 0) {
      throw new InvalidCommandException('User ID must be a positive number');
    }

    if (!this.currentPassword || this.currentPassword.length === 0) {
      throw new InvalidCommandException('Current password is required');
    }

    if (!this.newPassword || this.newPassword.length === 0) {
      throw new InvalidCommandException('New password is required');
    }

    if (this.newPassword.length < 8) {
      throw new InvalidCommandException('New password must be at least 8 characters');
    }

    const hasUpperCase = /[A-Z]/.test(this.newPassword);
    const hasLowerCase = /[a-z]/.test(this.newPassword);
    const hasNumber = /[0-9]/.test(this.newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      throw new InvalidCommandException(
        'New password must contain at least one uppercase letter, one lowercase letter, and one number'
      );
    }

    if (this.newPassword !== this.confirmPassword) {
      throw new InvalidCommandException('New password and confirmation do not match');
    }

    if (this.currentPassword === this.newPassword) {
      throw new InvalidCommandException('New password must be different from current password');
    }
  }
}