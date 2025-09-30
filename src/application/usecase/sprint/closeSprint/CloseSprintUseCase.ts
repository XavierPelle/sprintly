import { AbstractUseCase } from "../../../common/usecase/AbstractUseCase";
import { CloseSprintCommand } from "./CloseSprintCommand";
import { CloseSprintResponse } from "./CloseSprintResponse";
import { SprintRepository } from "../../../../domain/repositories/SprintRepository";
import { TicketRepository } from "../../../../domain/repositories/TicketRepository";
import { ApplicationException } from "../../../common/exceptions/ApplicationException";
import { TicketStatus } from "../../../../domain/enums/TicketStatus";

/**
 * Use case to close a sprint and handle incomplete tickets
 */
export class CloseSprintUseCase extends AbstractUseCase<
  CloseSprintCommand,
  CloseSprintResponse
> {
  protected static commandClass = CloseSprintCommand;

  constructor(
    private readonly sprintRepository: SprintRepository,
    private readonly ticketRepository: TicketRepository
  ) {
    super();
  }

  protected async doExecute(
    command: CloseSprintCommand
  ): Promise<Partial<CloseSprintResponse>> {
    
    // Get sprint with tickets
    const sprint = await this.sprintRepository.findOne(
      { id: command.sprintId },
      { relations: ['tickets', 'tickets.assignee'] }
    );

    if (!sprint) {
      throw new ApplicationException('SPRINT_NOT_FOUND', { 
        sprintId: command.sprintId 
      });
    }

    // Validate target sprint if moving tickets
    let targetSprint = null;
    if (command.moveIncompleteTo) {
      targetSprint = await this.sprintRepository.findOne(
        { id: command.moveIncompleteTo },
        { relations: ['tickets'] }
      );

      if (!targetSprint) {
        throw new ApplicationException('TARGET_SPRINT_NOT_FOUND', { 
          sprintId: command.moveIncompleteTo 
        });
      }

      // Check if target sprint is in the future
      const now = new Date();
      if (targetSprint.endDate < now) {
        throw new ApplicationException('TARGET_SPRINT_ALREADY_ENDED', {
          sprintId: command.moveIncompleteTo,
          endDate: targetSprint.endDate
        });
      }
    }

    // Categorize tickets
    const completedStatuses = [TicketStatus.TEST_OK, TicketStatus.PRODUCTION];
    
    const completedTickets = sprint.tickets.filter(t => 
      completedStatuses.includes(t.status)
    );
    
    const incompleteTickets = sprint.tickets.filter(t => 
      !completedStatuses.includes(t.status)
    );

    // Calculate statistics
    const totalTickets = sprint.tickets.length;
    const totalPoints = sprint.tickets.reduce((sum, t) => sum + t.difficultyPoints, 0);
    const completedPoints = completedTickets.reduce((sum, t) => sum + t.difficultyPoints, 0);
    const incompletePoints = incompleteTickets.reduce((sum, t) => sum + t.difficultyPoints, 0);
    const completionRate = totalPoints > 0 
      ? Math.round((completedPoints / totalPoints) * 100) 
      : 0;

    // Calculate velocity (points per day)
    const startDate = new Date(sprint.startDate);
    const endDate = new Date(sprint.endDate);
    const durationMs = endDate.getTime() - startDate.getTime();
    const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
    const velocity = durationDays > 0 
      ? Math.round((completedPoints / durationDays) * 10) / 10 
      : 0;

    // Handle incomplete tickets
    const incompleteTicketResults = [];

    for (const ticket of incompleteTickets) {
      let action: 'moved' | 'removed' | 'kept' = 'kept';
      let newSprintId = undefined;
      let newSprintName = undefined;

      if (command.moveIncompleteTo && targetSprint) {
        // Check capacity before moving
        const targetCurrentPoints = targetSprint.tickets.reduce(
          (sum, t) => sum + t.difficultyPoints, 
          0
        );

        if (targetCurrentPoints + ticket.difficultyPoints <= targetSprint.maxPoints) {
          // Move ticket to target sprint
          await this.ticketRepository.update(ticket.id, {
            sprint: { id: command.moveIncompleteTo } as any
          });

          action = 'moved';
          newSprintId = targetSprint.id;
          newSprintName = targetSprint.name;

          // Update target sprint's current points for next iteration
          targetSprint.tickets.push(ticket);
        } else {
          // Cannot move due to capacity - remove from sprint instead
          await this.ticketRepository.update(ticket.id, {
            sprint: null as any
          });
          action = 'removed';
        }
      } else if (command.removeIncomplete) {
        // Remove from sprint (move to backlog)
        await this.ticketRepository.update(ticket.id, {
          sprint: null as any
        });
        action = 'removed';
      }
      // else: kept in closed sprint

      incompleteTicketResults.push({
        id: ticket.id,
        key: ticket.key,
        title: ticket.title,
        status: ticket.status,
        difficultyPoints: ticket.difficultyPoints,
        action,
        newSprintId,
        newSprintName
      });
    }

    return {
      sprintId: sprint.id,
      sprintName: sprint.name,
      closedAt: new Date(),

      statistics: {
        totalTickets,
        totalPoints,
        completedTickets: completedTickets.length,
        completedPoints,
        incompleteTickets: incompleteTickets.length,
        incompletePoints,
        completionRate,
        velocity
      },

      incompleteTickets: incompleteTicketResults,

      message: `Sprint closed successfully. ${completedTickets.length}/${totalTickets} tickets completed (${completionRate}%)`
    };
  }
}