import { AbstractUseCase } from "../../../common/usecase/AbstractUseCase";
import { RemoveTagFromTicketCommand } from "./RemoveTagFromTicketCommand";
import { RemoveTagFromTicketResponse } from "./RemoveTagFromTicketResponse";
import { TicketRepository } from "../../../../domain/repositories/TicketRepository";
import { TagRepository } from "../../../../domain/repositories/TagRepository";
import { ApplicationException } from "../../../common/exceptions/ApplicationException";

export class RemoveTagFromTicketUseCase extends AbstractUseCase<
    RemoveTagFromTicketCommand,
    RemoveTagFromTicketResponse
> {
    protected static commandClass = RemoveTagFromTicketCommand;

    constructor(
        private readonly ticketRepository: TicketRepository,
        private readonly tagRepository: TagRepository
    ) {
        super();
    }

    protected async doExecute(
        command: RemoveTagFromTicketCommand
    ): Promise<Partial<RemoveTagFromTicketResponse>> {

        const ticket = await this.ticketRepository.findById(command.ticketId);
        if (!ticket) {
            throw new ApplicationException('TICKET_NOT_FOUND', {
                ticketId: command.ticketId
            });
        }

        const tag = await this.tagRepository.findById(command.tagId);
        if (!tag) {
            throw new ApplicationException('TAG_NOT_FOUND', {
                tagId: command.tagId
            });
        }

        const tagBelongsToTicket = await this.tagRepository.tagBelongsToTicket(
            command.tagId,
            command.ticketId
        );

        if (!tagBelongsToTicket) {
            throw new ApplicationException('TAG_NOT_ASSOCIATED_WITH_TICKET', {
                ticketId: command.ticketId,
                tagId: command.tagId
            });
        }

        const tagContent = tag.content;
        await this.tagRepository.delete(command.tagId);

        return {
            ticketId: command.ticketId,
            ticketKey: ticket.key,
            tagId: command.tagId,
            tagContent,
            message: `Tag "${tagContent}" removed from ticket ${ticket.key}`
        };
    }
}
