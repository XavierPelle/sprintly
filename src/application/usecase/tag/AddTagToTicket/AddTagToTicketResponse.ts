export interface AddTagToTicketResponse {
    ticketId: number;
    ticketKey: string;
    tag: {
        id: number;
        content: string;
        color: string;
        createdAt: Date;
    };
    message: string;
}
