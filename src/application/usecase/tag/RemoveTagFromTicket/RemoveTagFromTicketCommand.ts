import { Command } from "../../../common/usecase/Command";
import { InvalidCommandException } from "../../../common/exceptions/InvalidCommandException";

export class RemoveTagFromTicketCommand implements Command {
    constructor(
        public readonly ticketId: number,
        public readonly tagId: number
    ) {}

    validate(): void {
        if (!this.ticketId || this.ticketId <= 0) {
            throw new InvalidCommandException('Ticket ID must be a positive number');
        }

        if (!this.tagId || this.tagId <= 0) {
            throw new InvalidCommandException('Tag ID must be a positive number');
        }
    }
}
