export interface AssignTicketToUserResponse {
  ticketId: number;
  ticketKey: string;
  assigneeId: number | null;
  assigneeName: string | null;
  message: string;
}