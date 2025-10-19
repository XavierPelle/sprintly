export interface CreateTestForTicketResponse {
    id: number;
    ticketId: number;
    ticketKey: string;
    userId: number;
    userName: string;
    description: string;
    isValidated: boolean;
    createdAt: Date;
    imageUrls?: string[];
    message: string;
}