import { TicketStatus } from "../../../../domain/enums/TicketStatus";
import { TicketType } from "../../../../domain/enums/TicketType";

export interface GetUserDashboardResponse {
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };

  assignedTickets: {
    total: number;
    byStatus: Record<TicketStatus, number>;
    urgent: Array<{
      id: number;
      key: string;
      title: string;
      status: TicketStatus;
      difficultyPoints: number;
    }>;
  };

  createdTickets: {
    total: number;
    byStatus: Record<TicketStatus, number>;
    recent: Array<{
      id: number;
      key: string;
      title: string;
      status: TicketStatus;
      createdAt: Date;
    }>;
  };

  activeSprints: Array<{
    id: number;
    name: string;
    startDate: Date;
    endDate: Date;
    userTicketsCount: number;
    userTicketsPoints: number;
    totalPoints: number;
    progressPercentage: number;
  }>;

  testsToValidate: {
    total: number;
    tests: Array<{
      id: number;
      description: string;
      ticketKey: string;
      ticketTitle: string;
      createdAt: Date;
      createdBy: string;
    }>;
  };

  recentActivity: {
    commentsCount: number;
    testsCount: number;
    lastCommentDate: Date | null;
    lastTestDate: Date | null;
  };

  stats: {
    totalTicketsCreated: number;
    totalTicketsAssigned: number;
    totalComments: number;
    totalTests: number;
    completionRate: number;
  };
}