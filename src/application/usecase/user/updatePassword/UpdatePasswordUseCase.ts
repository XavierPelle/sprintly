import { AbstractUseCase } from "../../../common/usecase/AbstractUseCase";
import { UpdatePasswordCommand } from "./UpdatePasswordCommand";
import { UpdatePasswordResponse } from "./UpdatePasswordResponse";
import { UserRepository } from "../../../../domain/repositories/UserRepository";
import { ApplicationException } from "../../../common/exceptions/ApplicationException";
import * as bcrypt from "bcrypt";

/**
 * Use case to update user password
 * Verifies current password before allowing change
 */
export class UpdatePasswordUseCase extends AbstractUseCase<
  UpdatePasswordCommand,
  UpdatePasswordResponse
> {
  protected static commandClass = UpdatePasswordCommand;

  private readonly SALT_ROUNDS = 10;

  constructor(private readonly userRepository: UserRepository) {
    super();
  }

  protected async doExecute(
    command: UpdatePasswordCommand
  ): Promise<Partial<UpdatePasswordResponse>> {
    
    const user = await this.userRepository.findOne(
      { id: command.userId },
      { select: ['id', 'password', 'updatedAt'] }
    );

    if (!user) {
      throw new ApplicationException('USER_NOT_FOUND', { 
        userId: command.userId 
      });
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      command.currentPassword,
      (user as any).password
    );

    if (!isCurrentPasswordValid) {
      throw new ApplicationException('INVALID_CURRENT_PASSWORD', {}, 'AUTH_002');
    }

    const hashedPassword = await bcrypt.hash(command.newPassword, this.SALT_ROUNDS);

    await this.userRepository.update(command.userId, {
      password: hashedPassword
    });

    const updatedUser = await this.userRepository.findById(command.userId);

    return {
      userId: command.userId,
      message: 'Password updated successfully',
      updatedAt: updatedUser!.updatedAt
    };
  }
}