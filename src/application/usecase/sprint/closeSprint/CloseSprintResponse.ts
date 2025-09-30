import { TicketStatus } from "../../../../domain/enums/TicketStatus";

export interface CloseSprintResponse {
  sprintId: number;
  sprintName: string;
  closedAt: Date;

  statistics: {
    totalTickets: number;
    totalPoints: number;
    completedTickets: number;
    completedPoints: number;
    incompleteTickets: number;
    incompletePoints: number;
    completionRate: number;
    velocity: number; // Points per day
  };

  incompleteTickets: Array<{
    id: number;
    key: string;
    title: string;
    status: TicketStatus;
    difficultyPoints: number;
    action: 'moved' | 'removed' | 'kept';
    newSprintId?: number;
    newSprintName?: string;
  }>;

  message: string;
}