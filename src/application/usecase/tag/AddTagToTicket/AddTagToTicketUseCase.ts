import { AbstractUseCase } from "../../../common/usecase/AbstractUseCase";
import { AddTagToTicketCommand } from "./AddTagToTicketCommand";
import { AddTagToTicketResponse } from "./AddTagToTicketResponse";
import { TicketRepository } from "../../../../domain/repositories/TicketRepository";
import { TagRepository } from "../../../../domain/repositories/TagRepository";
import { ApplicationException } from "../../../common/exceptions/ApplicationException";
import { Tag } from "../../../../domain/entities/Tag";

export class AddTagToTicketUseCase extends AbstractUseCase<
    AddTagToTicketCommand,
    AddTagToTicketResponse
> {
    protected static commandClass = AddTagToTicketCommand;

    constructor(
        private readonly ticketRepository: TicketRepository,
        private readonly tagRepository: TagRepository
    ) {
        super();
    }

    protected async doExecute(
        command: AddTagToTicketCommand
    ): Promise<Partial<AddTagToTicketResponse>> {

        const ticket = await this.ticketRepository.findById(command.ticketId);
        if (!ticket) {
            throw new ApplicationException('TICKET_NOT_FOUND', {
                ticketId: command.ticketId
            });
        }

        const existingTags = await this.tagRepository.findByTicketId(command.ticketId);
        const duplicateTag = existingTags.find(
            tag => tag.content.toLowerCase() === command.content.trim().toLowerCase()
        );

        if (duplicateTag) {
            throw new ApplicationException('TAG_ALREADY_EXISTS', {
                ticketId: command.ticketId,
                content: command.content
            });
        }

        if (existingTags.length >= 10) {
            throw new ApplicationException('MAX_TAGS_REACHED', {
                ticketId: command.ticketId,
                maxTags: 10
            });
        }

        const savedTag = await this.tagRepository.create({
            content: command.content.trim(),
            color: command.color,
            ticket: ticket
        });

        return {
            ticketId: command.ticketId,
            ticketKey: ticket.key,
            tag: {
                id: savedTag.id,
                content: savedTag.content,
                color: savedTag.color,
                createdAt: savedTag.createdAt
            },
            message: `Tag "${savedTag.content}" added to ticket ${ticket.key}`
        };
    }
}
