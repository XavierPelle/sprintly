import { AbstractUseCase } from "../../../common/usecase/AbstractUseCase";
import { AddTicketsToSprintCommand } from "./AddTicketsToSprintCommand";
import { SprintRepository } from "../../../../domain/repositories/SprintRepository";
import { TicketRepository } from "../../../../domain/repositories/TicketRepository";
import { ApplicationException } from "../../../common/exceptions/ApplicationException";
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

    const sprint = await this.sprintRepository.findOne(
      { id: command.sprintId },
      { relations: ['tickets'] }
    );
    
    if (!sprint) {
      throw new ApplicationException('SPRINT_NOT_FOUND', { sprintId: command.sprintId });
    }

    // Vérifier que tous les tickets existent
    const tickets = await Promise.all(
      command.ticketIds.map(id => this.ticketRepository.findById(id))
    );

    const notFoundTickets = command.ticketIds.filter((id, index) => !tickets[index]);
    if (notFoundTickets.length > 0) {
      throw new ApplicationException('TICKETS_NOT_FOUND', { 
        ticketIds: notFoundTickets 
      });
    }

    const currentPoints = sprint.tickets.reduce((sum, t) => sum + t.difficultyPoints, 0);
    const newPoints = tickets.reduce((sum, t) => sum + (t?.difficultyPoints || 0), 0);
    
    if (currentPoints + newPoints > sprint.maxPoints) {
      throw new ApplicationException('SPRINT_CAPACITY_EXCEEDED', {
        sprintId: command.sprintId,
        currentPoints,
        maxPoints: sprint.maxPoints,
        newPoints,
        availablePoints: sprint.maxPoints - currentPoints
      });
    }

    for (const ticketId of command.ticketIds) {
      await this.ticketRepository.update(ticketId, {
        sprint: { id: command.sprintId } as any
      });
    }

    return {
      sprintId: command.sprintId,
      addedTicketIds: command.ticketIds,
      message: `Successfully added ${command.ticketIds.length} ticket(s) to sprint`
    };
  }
}