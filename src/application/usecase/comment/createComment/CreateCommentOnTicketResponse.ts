export interface CreateCommentOnTicketResponse {
  id: number;
  ticketId: number;
  ticketKey: string;
  userId: number;
  userName: string;
  description: string;
  createdAt: Date;
  message: string;
}