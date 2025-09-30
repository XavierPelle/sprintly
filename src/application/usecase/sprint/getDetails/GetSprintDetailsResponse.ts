import { TicketStatus } from "../../../../domain/enums/TicketStatus";
import { TicketType } from "../../../../domain/enums/TicketType";

export interface GetSprintDetailsResponse {
  id: number;
  name: string;
  maxPoints: number;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
  
  tickets: Array<{
    id: number;
    key: string;
    title: string;
    status: TicketStatus;
    type: TicketType;
    difficultyPoints: number;
    assignee: {
      id: number;
      firstName: string;
      lastName: string;
    } | null;
  }>;
  
  stats: {
    totalTickets: number;
    totalPoints: number;
    completedPoints: number;
    remainingPoints: number;
    progressPercentage: number;
    ticketsByStatus: Record<TicketStatus, number>;
    ticketsByType: Record<TicketType, number>;
    isOverCapacity: boolean;
  };
}