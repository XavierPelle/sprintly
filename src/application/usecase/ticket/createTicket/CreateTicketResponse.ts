import { TicketPriority } from "../../../../domain/enums/TicketPriority";
import { TicketStatus } from "../../../../domain/enums/TicketStatus";
import { TicketType } from "../../../../domain/enums/TicketType";

export interface CreateTicketResponse {
  id: number;
  key: string;
  title: string;
  description: string;
  status: TicketStatus;
  type: TicketType;
  difficultyPoints: number;
  createdAt: Date;
  priority: TicketPriority;
  pullRequestLink: string;
  testLink: string;
  branch: string;

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
  
  message: string;
}