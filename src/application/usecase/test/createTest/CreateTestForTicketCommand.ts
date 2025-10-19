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
        }>
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

        if (this.description.length > 10000) {
            throw new InvalidCommandException('Test description must not exceed 10000 characters');
        }

        if (this.imageFiles && this.imageFiles.length > 10) {
            throw new InvalidCommandException('Maximum 10 images allowed');
        }

        const validImageTypes = ['AVATAR', 'TICKET_ATTACHMENT', 'TEST_ATTACHMENT'];
        if (!validImageTypes.includes(this.imageType)) {
            throw new InvalidCommandException('Invalid image type');
        }
    }
}