import { AbstractUseCase } from "../../common/usecase/AbstractUseCase";
import { AddTicketsToSprintCommand } from "./AddTicketsToSprintCommand";
import { SprintRepository } from "../../../domain/repositories/SprintRepository";
import { TicketRepository } from "../../../domain/repositories/TicketRepository";
import { ApplicationException } from "../../common/exceptions/ApplicationException";
import { AddTicketsToSprintResponse } from "./AddTicketsToSprintResponse";


/**
 * Use case to add tickets to a sprint
 */
export class AddTicketsToSprintUseCase extends AbstractUseCase<
  AddTicketsToSprintCommand,
  AddTicketsToSprintResponse
> {
  protected static commandClass = AddTicketsToSprintCommand;

  constructor(
    private readonly sprintRepository: SprintRepository,
    private readonly ticketRepository: TicketRepository
  ) {
    super();
  }

  protected async doExecute(
    command: AddTicketsToSprintCommand
  ): Promise<Partial<AddTicketsToSprintResponse>> {

    const sprint = await this.sprintRepository.findById(command.sprintId);
    if (!sprint) {
      throw new ApplicationException('SPRINT_NOT_FOUND', { sprintId: command.sprintId });
    }

    const tickets = await Promise.all(
      command.ticketIds.map(id => this.ticketRepository.findById(id))
    );

    const notFoundTickets = command.ticketIds.filter((id, index) => !tickets[index]);
    if (notFoundTickets.length > 0) {
      throw new ApplicationException('TICKETS_NOT_FOUND', { 
        ticketIds: notFoundTickets 
      });
    }

    await this.ticketRepository.updateMany(
      { id: command.ticketIds as any },
      { sprint: { id: command.sprintId } as any }
    );

    return {
      sprintId: command.sprintId,
      addedTicketIds: command.ticketIds,
      message: `Successfully added ${command.ticketIds.length} ticket(s) to sprint`
    };
  }
}