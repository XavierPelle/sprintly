import { AbstractUseCase } from "../../../common/usecase/AbstractUseCase";
import { RegisterUserCommand } from "./RegisterUserCommand";
import { RegisterUserResponse } from "./RegisterUserResponse";
import { UserRepository } from "../../../../domain/repositories/UserRepository";
import { ApplicationException } from "../../../common/exceptions/ApplicationException";
import * as bcrypt from "bcrypt";

/**
 * Use case to register a new user
 * Handles password hashing and email uniqueness validation
 */
export class RegisterUserUseCase extends AbstractUseCase<
  RegisterUserCommand,
  RegisterUserResponse
> {
  protected static commandClass = RegisterUserCommand;

  private readonly SALT_ROUNDS = 10;

  constructor(private readonly userRepository: UserRepository) {
    super();
  }

  protected async doExecute(
    command: RegisterUserCommand
  ): Promise<Partial<RegisterUserResponse>> {
    
    const existingUser = await this.userRepository.findByEmail(command.email);
    if (existingUser) {
      throw new ApplicationException('EMAIL_ALREADY_EXISTS', { 
        email: command.email 
      });
    }

    const hashedPassword = await bcrypt.hash(command.password, this.SALT_ROUNDS);

    const user = await this.userRepository.create({
      firstName: command.firstName,
      lastName: command.lastName,
      email: command.email,
      password: hashedPassword
    });

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      createdAt: user.createdAt,
      message: 'User registered successfully'
    };
  }
}