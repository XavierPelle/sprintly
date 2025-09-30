import { TicketStatus } from "../../../../domain/enums/TicketStatus";
import { TicketType } from "../../../../domain/enums/TicketType";

export interface GetProjectDashboardResponse {
  overview: {
    totalTickets: number;
    totalUsers: number;
    totalSprints: number;
    activeSprints: number;
    completedSprints: number;
  };

  tickets: {
    byStatus: Record<TicketStatus, number>;
    byType: Record<TicketType, number>;
    totalPoints: number;
    completedPoints: number;
    averagePointsPerTicket: number;
    unassignedCount: number;
    withoutSprintCount: number;
  };

  sprints: {
    active: Array<{
      id: number;
      name: string;
      startDate: Date;
      endDate: Date;
      totalPoints: number;
      completedPoints: number;
      progressPercentage: number;
      ticketsCount: number;
      daysRemaining: number;
    }>;
    upcoming: Array<{
      id: number;
      name: string;
      startDate: Date;
      endDate: Date;
      ticketsCount: number;
      totalPoints: number;
    }>;
    recentlyCompleted: Array<{
      id: number;
      name: string;
      endDate: Date;
      completionRate: number;
      velocity: number;
    }>;
  };

  team: {
    mostActiveUsers: Array<{
      id: number;
      name: string;
      assignedTickets: number;
      completedTickets: number;
      commentsCount: number;
      testsCount: number;
    }>;
    workloadDistribution: Array<{
      userId: number;
      userName: string;
      assignedPoints: number;
      completedPoints: number;
      workloadPercentage: number;
    }>;
  };

  quality: {
    totalTests: number;
    validatedTests: number;
    validationRate: number;
    totalComments: number;
    averageCommentsPerTicket: number;
    ticketsWithTests: number;
    testCoverage: number;
  };

  trends?: {
    velocityByWeek: Array<{
      weekStart: Date;
      pointsCompleted: number;
      ticketsCompleted: number;
    }>;
    ticketCreationByWeek: Array<{
      weekStart: Date;
      ticketsCreated: number;
    }>;
  };
}