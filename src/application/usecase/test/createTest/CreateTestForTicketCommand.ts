import { Command } from "../../../common/usecase/Command";
import { InvalidCommandException } from "../../../common/exceptions/InvalidCommandException";

export class CreateTestForTicketCommand implements Command {
    constructor(
        public readonly ticketId: number,
        public readonly userId: number,
        public readonly description: string,
        public readonly imageType: string = 'TEST_ATTACHMENT',
        public readonly imageFiles?: Array<{
            filename: string;
            mimetype: string;
            data: Buffer;
        }>,
        public readonly displayOrders?: number[] | string
    ) {}

    validate(): void {
        if (!this.ticketId || this.ticketId <= 0) {
            throw new InvalidCommandException('Ticket ID must be a positive number');
        }

        if (!this.userId || this.userId <= 0) {
            throw new InvalidCommandException('User ID must be a positive number');
        }

        if (!this.description || this.description.trim().length === 0) {
            throw new InvalidCommandException('Test description is required');
        }

        if (this.description.trim().length < 10) {
            throw new InvalidCommandException('Test description must be at least 10 characters');
        }

        if (this.description.length > 50000) {
            throw new InvalidCommandException('Test description must not exceed 50000 characters');
        }

        if (this.imageFiles && this.imageFiles.length > 10) {
            throw new InvalidCommandException('Maximum 10 images allowed');
        }

        const validImageTypes = ['AVATAR', 'TICKET_ATTACHMENT', 'TEST_ATTACHMENT'];
        if (!validImageTypes.includes(this.imageType)) {
            throw new InvalidCommandException('Invalid image type');
        }

        if (this.displayOrders) {
            let orders: number[] = [];
            
            try {
                orders = typeof this.displayOrders === 'string' 
                    ? JSON.parse(this.displayOrders)
                    : this.displayOrders;
            } catch (error) {
                throw new InvalidCommandException('Invalid displayOrders format');
            }

            if (!Array.isArray(orders)) {
                throw new InvalidCommandException('displayOrders must be an array');
            }

            if (this.imageFiles && orders.length !== this.imageFiles.length) {
                throw new InvalidCommandException(
                    `displayOrders length (${orders.length}) must match imageFiles length (${this.imageFiles.length})`
                );
            }

            const hasInvalidOrder = orders.some(order => typeof order !== 'number' || order <= 0);
            if (hasInvalidOrder) {
                throw new InvalidCommandException('All displayOrders must be positive numbers');
            }
        }
    }
}