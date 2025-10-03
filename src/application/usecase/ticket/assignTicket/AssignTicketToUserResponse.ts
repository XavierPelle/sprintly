export interface AssignTicketToUserResponse {
  ticketId: number;
  ticketKey: string;
  assignee: number | null;
  assigneeName: string | null;
  message: string;
}