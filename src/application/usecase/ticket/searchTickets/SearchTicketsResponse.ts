import { TicketStatus } from "../../../../domain/enums/TicketStatus";
import { TicketType } from "../../../../domain/enums/TicketType";

export interface SearchTicketsResponse {
  tickets: Array<{
    id: number;
    key: string;
    title: string;
    description: string;
    status: TicketStatus;
    type: TicketType;
    difficultyPoints: number;
    createdAt: Date;
    updatedAt: Date;
    
    creator: {
      id: number;
      firstName: string;
      lastName: string;
    };
    
    assignee: {
      id: number;
      firstName: string;
      lastName: string;
    } | null;
    
    sprint: {
      id: number;
      name: string;
    } | null;
  }>;

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };

  filters: {
    query?: string;
    status?: TicketStatus;
    type?: TicketType;
    assigneeId?: number;
    creatorId?: number;
    sprintId?: number;
    minPoints?: number;
    maxPoints?: number;
  };
}