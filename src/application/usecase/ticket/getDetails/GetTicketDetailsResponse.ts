import { TicketPriority } from "../../../../domain/enums/TicketPriority";
import { TicketStatus } from "../../../../domain/enums/TicketStatus";
import { TicketType } from "../../../../domain/enums/TicketType";

export interface GetTicketDetailsResponse {
  id: number;
  key: string;
  title: string;
  description: string;
  status: TicketStatus;
  type: TicketType;
  difficultyPoints: number;
  createdAt: Date;
  updatedAt: Date;
  priority: TicketPriority;
  
  creator: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  
  assignee: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  
  sprint: {
    id: number;
    name: string;
    startDate: Date;
    endDate: Date;
  } | null;
  
  images: Array<{
    id: number;
    url: string;
    filename: string;
    displayOrder: number;
  }>;
  
  comments: Array<{
    id: number;
    description: string;
    createdAt: Date;
    user: {
      id: number;
      firstName: string;
      lastName: string;
    };
  }>;
  
  tests: Array<{
    id: number;
    description: string;
    isValidated: boolean;
    createdAt: Date;
    user: {
      id: number;
      firstName: string;
      lastName: string;
    };
  }>;
  
  stats: {
    totalComments: number;
    totalTests: number;
    validatedTests: number;
    totalImages: number;
  };
}