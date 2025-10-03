import { AbstractUseCase } from "../../../common/usecase/AbstractUseCase";
import { LoginUserCommand } from "./LoginUserCommand";
import { LoginUserResponse } from "./LoginUserResponse";
import { UserRepository } from "../../../../domain/repositories/UserRepository";
import { ApplicationException } from "../../../common/exceptions/ApplicationException";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";

/**
 * Use case to authenticate a user
 * Verifies credentials and generates JWT tokens
 */
export class LoginUserUseCase extends AbstractUseCase<
  LoginUserCommand,
  LoginUserResponse
> {
  protected static commandClass = LoginUserCommand;

  private readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  private readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
  private readonly ACCESS_TOKEN_EXPIRES_IN = '1d';
  private readonly REFRESH_TOKEN_EXPIRES_IN = '7d';

  constructor(private readonly userRepository: UserRepository) {
    super();
  }

  protected async doExecute(
    command: LoginUserCommand
  ): Promise<Partial<LoginUserResponse>> {
    
    // Find user by email (need to select password field)
    const user = await this.userRepository.findOne(
      { email: command.email },
      { select: ['id', 'firstName', 'lastName', 'email', 'password'] }
    );

    if (!user) {
      throw new ApplicationException('INVALID_CREDENTIALS', {}, 'AUTH_001');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      command.password,
      (user as any).password
    );

    if (!isPasswordValid) {
      throw new ApplicationException('INVALID_CREDENTIALS', {}, 'AUTH_001');
    }

    // Generate tokens
    const payload = {
      userId: user.id,
      email: user.email
    };

    const accessToken = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRES_IN
    });

    const refreshToken = jwt.sign(payload, this.JWT_REFRESH_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRES_IN
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      },
      message: 'Login successful'
    };
  }
}