import { AbstractUseCase } from "../../../common/usecase/AbstractUseCase";
import { ValidateTestCommand } from "./ValidateTestCommand";
import { ValidateTestResponse } from "./ValidateTestResponse";
import { TestRepository } from "../../../../domain/repositories/TestRepository";
import { UserRepository } from "../../../../domain/repositories/UserRepository";
import { ApplicationException } from "../../../common/exceptions/ApplicationException";

/**
 * Use case to validate or reject a test
 */
export class ValidateTestUseCase extends AbstractUseCase<
  ValidateTestCommand,
  ValidateTestResponse
> {
  protected static commandClass = ValidateTestCommand;

  constructor(
    private readonly testRepository: TestRepository,
    private readonly userRepository: UserRepository
  ) {
    super();
  }

  protected async doExecute(
    command: ValidateTestCommand
  ): Promise<Partial<ValidateTestResponse>> {
    
    const test = await this.testRepository.findOne(
      { id: command.testId },
      { relations: ['ticket'] }
    );

    if (!test) {
      throw new ApplicationException('TEST_NOT_FOUND', { 
        testId: command.testId 
      });
    }

    const validator = await this.userRepository.findById(command.validatedBy);
    if (!validator) {
      throw new ApplicationException('USER_NOT_FOUND', { 
        userId: command.validatedBy 
      });
    }

    // Update test validation status
    await this.testRepository.update(command.testId, {
      isValidated: command.isValidated
    });

    const updatedTest = await this.testRepository.findById(command.testId);

    return {
      testId: command.testId,
      ticketId: test.ticket.id,
      ticketKey: test.ticket.key,
      isValidated: command.isValidated,
      validatedBy: command.validatedBy,
      validatedByName: `${validator.firstName} ${validator.lastName}`,
      updatedAt: updatedTest!.updatedAt,
      message: command.isValidated 
        ? 'Test validated successfully' 
        : 'Test rejected'
    };
  }
}