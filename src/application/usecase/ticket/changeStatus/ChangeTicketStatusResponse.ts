import { TicketStatus } from "../../../../domain/enums/TicketStatus";

export interface ChangeTicketStatusResponse {
  ticketId: number;
  ticketKey: string;
  previousStatus: TicketStatus;
  newStatus: TicketStatus;
  message: string;
}