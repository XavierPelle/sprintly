import { AbstractUseCase } from "../../../common/usecase/AbstractUseCase";
import { GetUserDashboardCommand } from "./GetUserDashboardCommand";
import { GetUserDashboardResponse } from "./GetUserDashboardResponse";
import { UserRepository } from "../../../../domain/repositories/UserRepository";
import { TicketRepository } from "../../../../domain/repositories/TicketRepository";
import { SprintRepository } from "../../../../domain/repositories/SprintRepository";
import { TestRepository } from "../../../../domain/repositories/TestRepository";
import { CommentRepository } from "../../../../domain/repositories/CommentRepository";
import { ApplicationException } from "../../../common/exceptions/ApplicationException";
import { TicketStatus } from "../../../../domain/enums/TicketStatus";

/**
 * Use case to get personalized user dashboard
 */
export class GetUserDashboardUseCase extends AbstractUseCase<
  GetUserDashboardCommand,
  GetUserDashboardResponse
> {
  protected static commandClass = GetUserDashboardCommand;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly ticketRepository: TicketRepository,
    private readonly sprintRepository: SprintRepository,
    private readonly testRepository: TestRepository,
    private readonly commentRepository: CommentRepository
  ) {
    super();
  }

  protected async doExecute(
    command: GetUserDashboardCommand
  ): Promise<Partial<GetUserDashboardResponse>> {
    
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new ApplicationException('USER_NOT_FOUND', { 
        userId: command.userId 
      });
    }

    const assignedTickets = await this.ticketRepository.findBy(
      { assignee: { id: command.userId } as any },
      { relations: ['assignee', 'sprint'] }
    );

    const assignedByStatus: Record<TicketStatus, number> = {} as any;
    Object.values(TicketStatus).forEach(status => {
      assignedByStatus[status] = assignedTickets.filter(t => t.status === status).length;
    });

    const urgentTickets = assignedTickets
      .filter(t => t.status === TicketStatus.TODO || t.status === TicketStatus.IN_PROGRESS)
      .slice(0, 5)
      .map(t => ({
        id: t.id,
        key: t.key,
        title: t.title,
        status: t.status,
        difficultyPoints: t.difficultyPoints
      }));

    const createdTickets = await this.ticketRepository.findBy(
      { creator: { id: command.userId } as any },
      { order: { createdAt: 'DESC' } }
    );

    const createdByStatus: Record<TicketStatus, number> = {} as any;
    Object.values(TicketStatus).forEach(status => {
      createdByStatus[status] = createdTickets.filter(t => t.status === status).length;
    });

    const recentCreated = createdTickets.slice(0, 5).map(t => ({
      id: t.id,
      key: t.key,
      title: t.title,
      status: t.status,
      createdAt: t.createdAt
    }));

    const now = new Date();
    const allSprints = await this.sprintRepository.findAll({
      relations: ['tickets', 'tickets.assignee']
    });

    const activeSprints = allSprints
      .filter(sprint => 
        sprint.startDate <= now && 
        sprint.endDate >= now &&
        sprint.tickets.some(t => t.assignee?.id === command.userId)
      )
      .map(sprint => {
        const userTickets = sprint.tickets.filter(t => t.assignee?.id === command.userId);
        const userTicketsPoints = userTickets.reduce((sum, t) => sum + t.difficultyPoints, 0);
        const totalPoints = sprint.tickets.reduce((sum, t) => sum + t.difficultyPoints, 0);
        
        const completedStatuses = [TicketStatus.TEST_OK, TicketStatus.PRODUCTION];
        const completedPoints = sprint.tickets
          .filter(t => completedStatuses.includes(t.status))
          .reduce((sum, t) => sum + t.difficultyPoints, 0);
        
        const progressPercentage = totalPoints > 0 
          ? Math.round((completedPoints / totalPoints) * 100) 
          : 0;

        return {
          id: sprint.id,
          name: sprint.name,
          startDate: sprint.startDate,
          endDate: sprint.endDate,
          userTicketsCount: userTickets.length,
          userTicketsPoints,
          totalPoints,
          progressPercentage
        };
      });

    const allTests = await this.testRepository.findBy(
      { isValidated: false },
      { relations: ['ticket', 'user'] }
    );

    const testsToValidate = allTests
      .filter(test => test.user.id !== command.userId)
      .slice(0, 10)
      .map(test => ({
        id: test.id,
        description: test.description,
        ticketKey: test.ticket.key,
        ticketTitle: test.ticket.title,
        createdAt: test.createdAt,
        createdBy: `${test.user.firstName} ${test.user.lastName}`
      }));

    const userComments = await this.commentRepository.findBy(
      { user: { id: command.userId } as any },
      { order: { createdAt: 'DESC' } }
    );

    const userTests = await this.testRepository.findBy(
      { user: { id: command.userId } as any },
      { order: { createdAt: 'DESC' } }
    );

    const completedTickets = assignedTickets.filter(t => 
      t.status === TicketStatus.PRODUCTION
    ).length;

    const completionRate = assignedTickets.length > 0
      ? Math.round((completedTickets / assignedTickets.length) * 100)
      : 0;

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      },

      assignedTickets: {
        total: assignedTickets.length,
        byStatus: assignedByStatus,
        urgent: urgentTickets
      },

      createdTickets: {
        total: createdTickets.length,
        byStatus: createdByStatus,
        recent: recentCreated
      },

      activeSprints,

      testsToValidate: {
        total: testsToValidate.length,
        tests: testsToValidate
      },

      recentActivity: {
        commentsCount: userComments.length,
        testsCount: userTests.length,
        lastCommentDate: userComments.length > 0 ? userComments[0].createdAt : null,
        lastTestDate: userTests.length > 0 ? userTests[0].createdAt : null
      },

      stats: {
        totalTicketsCreated: createdTickets.length,
        totalTicketsAssigned: assignedTickets.length,
        totalComments: userComments.length,
        totalTests: userTests.length,
        completionRate
      }
    };
  }
}