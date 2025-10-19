import { Command } from "../../../common/usecase/Command";
import { InvalidCommandException } from "../../../common/exceptions/InvalidCommandException";

export class AddTagToTicketCommand implements Command {
    constructor(
        public readonly ticketId: number,
        public readonly content: string,
        public readonly color: string
    ) {}

    validate(): void {
        if (!this.ticketId || this.ticketId <= 0) {
            throw new InvalidCommandException('Ticket ID must be a positive number');
        }

        if (!this.content || this.content.trim().length === 0) {
            throw new InvalidCommandException('Tag content cannot be empty');
        }

        if (this.content.trim().length > 50) {
            throw new InvalidCommandException('Tag content must not exceed 50 characters');
        }

        if (!this.color || !this.isValidHexColor(this.color)) {
            throw new InvalidCommandException('Color must be a valid hex color (e.g., #FF5733)');
        }
    }

    private isValidHexColor(color: string): boolean {
        return /^#[0-9A-F]{6}$/i.test(color);
    }
}
