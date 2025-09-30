import { AbstractUseCase } from "../../../common/usecase/AbstractUseCase";
import { CreateTestForTicketCommand } from "./CreateTestForTicketCommand";
import { CreateTestForTicketResponse } from "./CreateTestForTicketResponse";
import { TestRepository } from "../../../../domain/repositories/TestRepository";
import { TicketRepository } from "../../../../domain/repositories/TicketRepository";
import { UserRepository } from "../../../../domain/repositories/UserRepository";
import { ApplicationException } from "../../../common/exceptions/ApplicationException";

/**
 * Use case to create a test for a ticket
 */
export class CreateTestForTicketUseCase extends AbstractUseCase<
  CreateTestForTicketCommand,
  CreateTestForTicketResponse
> {
  protected static commandClass = CreateTestForTicketCommand;

  constructor(
    private readonly testRepository: TestRepository,
    private readonly ticketRepository: TicketRepository,
    private readonly userRepository: UserRepository
  ) {
    super();
  }

  protected async doExecute(
    command: CreateTestForTicketCommand
  ): Promise<Partial<CreateTestForTicketResponse>> {
    
    const ticket = await this.ticketRepository.findById(command.ticketId);
    if (!ticket) {
      throw new ApplicationException('TICKET_NOT_FOUND', { 
        ticketId: command.ticketId 
      });
    }

    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new ApplicationException('USER_NOT_FOUND', { 
        userId: command.userId 
      });
    }

    const test = await this.testRepository.create({
      description: command.description.trim(),
      isValidated: false,
      user: { id: command.userId } as any,
      ticket: { id: command.ticketId } as any
    });

    return {
      id: test.id,
      ticketId: command.ticketId,
      ticketKey: ticket.key,
      userId: command.userId,
      userName: `${user.firstName} ${user.lastName}`,
      description: test.description,
      isValidated: test.isValidated,
      createdAt: test.createdAt,
      message: 'Test created successfully'
    };
  }
}