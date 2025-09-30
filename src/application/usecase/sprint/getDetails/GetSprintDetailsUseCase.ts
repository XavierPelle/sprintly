import { AbstractUseCase } from "../../../common/usecase/AbstractUseCase";
import { GetSprintDetailsCommand } from "./GetSprintDetailsCommand";
import { GetSprintDetailsResponse } from "./GetSprintDetailsResponse";
import { SprintRepository } from "../../../../domain/repositories/SprintRepository";
import { ApplicationException } from "../../../common/exceptions/ApplicationException";
import { TicketStatus } from "../../../../domain/enums/TicketStatus";
import { TicketType } from "../../../../domain/enums/TicketType";

/**
 * Use case to get complete sprint details with tickets and statistics
 */
export class GetSprintDetailsUseCase extends AbstractUseCase<
  GetSprintDetailsCommand,
  GetSprintDetailsResponse
> {
  protected static commandClass = GetSprintDetailsCommand;

  constructor(private readonly sprintRepository: SprintRepository) {
    super();
  }

  protected async doExecute(
    command: GetSprintDetailsCommand
  ): Promise<Partial<GetSprintDetailsResponse>> {
    
    const sprint = await this.sprintRepository.findOne(
      { id: command.sprintId },
      {
        relations: ['tickets', 'tickets.assignee']
      }
    );

    if (!sprint) {
      throw new ApplicationException('SPRINT_NOT_FOUND', { 
        sprintId: command.sprintId 
      });
    }

    const totalPoints = sprint.tickets.reduce(
      (sum, ticket) => sum + ticket.difficultyPoints, 
      0
    );

    const completedStatuses = [
      TicketStatus.TEST_OK,
      TicketStatus.PRODUCTION
    ];

    const completedPoints = sprint.tickets
      .filter(ticket => completedStatuses.includes(ticket.status))
      .reduce((sum, ticket) => sum + ticket.difficultyPoints, 0);

    const remainingPoints = totalPoints - completedPoints;
    const progressPercentage = totalPoints > 0 
      ? Math.round((completedPoints / totalPoints) * 100) 
      : 0;

    const ticketsByStatus: Record<TicketStatus, number> = {} as any;
    Object.values(TicketStatus).forEach(status => {
      ticketsByStatus[status] = sprint.tickets.filter(
        ticket => ticket.status === status
      ).length;
    });

    const ticketsByType: Record<TicketType, number> = {} as any;
    Object.values(TicketType).forEach(type => {
      ticketsByType[type] = sprint.tickets.filter(
        ticket => ticket.type === type
      ).length;
    });

    return {
      id: sprint.id,
      name: sprint.name,
      maxPoints: sprint.maxPoints,
      startDate: sprint.startDate,
      endDate: sprint.endDate,
      createdAt: sprint.createdAt,
      updatedAt: sprint.updatedAt,
      
      tickets: sprint.tickets.map(ticket => ({
        id: ticket.id,
        key: ticket.key,
        title: ticket.title,
        status: ticket.status,
        type: ticket.type,
        difficultyPoints: ticket.difficultyPoints,
        assignee: ticket.assignee ? {
          id: ticket.assignee.id,
          firstName: ticket.assignee.firstName,
          lastName: ticket.assignee.lastName
        } : null
      })),
      
      stats: {
        totalTickets: sprint.tickets.length,
        totalPoints,
        completedPoints,
        remainingPoints,
        progressPercentage,
        ticketsByStatus,
        ticketsByType,
        isOverCapacity: totalPoints > sprint.maxPoints
      }
    };
  }
}