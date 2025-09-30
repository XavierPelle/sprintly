import { AbstractUseCase } from "../../../common/usecase/AbstractUseCase";
import { RemoveTicketsFromSprintCommand } from "./removeTicketFromSprintCommand";
import { SprintRepository } from "../../../../domain/repositories/SprintRepository";
import { TicketRepository } from "../../../../domain/repositories/TicketRepository";
import { ApplicationException } from "../../../common/exceptions/ApplicationException";
import { RemoveTicketsFromSprintResponse } from "./RemoveTicketsFromSprintResponse";

/**
 * Use case to remove tickets from a sprint
 */
export class RemoveTicketsFromSprintUseCase extends AbstractUseCase<
  RemoveTicketsFromSprintCommand,
  RemoveTicketsFromSprintResponse
> {
  protected static commandClass = RemoveTicketsFromSprintCommand;

  constructor(
    private readonly sprintRepository: SprintRepository,
    private readonly ticketRepository: TicketRepository
  ) {
    super();
  }

  protected async doExecute(
    command: RemoveTicketsFromSprintCommand
  ): Promise<Partial<RemoveTicketsFromSprintResponse>> {

    const sprint = await this.sprintRepository.findById(command.sprintId);
    if (!sprint) {
      throw new ApplicationException('SPRINT_NOT_FOUND', { sprintId: command.sprintId });
    }

    const tickets = await Promise.all(
      command.ticketIds.map(id => 
        this.ticketRepository.findOne({ id }, { relations: ['sprint'] })
      )
    );

    const notFoundTickets = command.ticketIds.filter((id, index) => !tickets[index]);
    if (notFoundTickets.length > 0) {
      throw new ApplicationException('TICKETS_NOT_FOUND', { 
        ticketIds: notFoundTickets 
      });
    }

    const ticketsNotInSprint = command.ticketIds.filter((id, index) => {
      const ticket = tickets[index];
      return ticket && (!ticket.sprint || ticket.sprint.id !== command.sprintId);
    });

    if (ticketsNotInSprint.length > 0) {
      throw new ApplicationException('TICKETS_NOT_IN_SPRINT', { 
        ticketIds: ticketsNotInSprint,
        sprintId: command.sprintId
      });
    }

    await this.ticketRepository.updateMany(
      { id: command.ticketIds as any },
      { sprint: null as any }
    );

    return {
      sprintId: command.sprintId,
      removedTicketIds: command.ticketIds,
      message: `Successfully removed ${command.ticketIds.length} ticket(s) from sprint`
    };
  }
}