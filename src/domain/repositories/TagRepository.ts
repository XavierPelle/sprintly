import { Repository } from "typeorm";
import { AbstractRepository } from "./AbstractRepository";
import { Tag } from "../entities/Tag";

export class TagRepository extends AbstractRepository<Tag> {
    constructor(repository: Repository<Tag>) {
        super(repository);
    }

    async findByTicketId(ticketId: number): Promise<Tag[]> {
        return this.findBy(
            { ticket: { id: ticketId } } as any,
            { order: { createdAt: 'ASC' } }
        );
    }

    async tagBelongsToTicket(tagId: number, ticketId: number): Promise<boolean> {
        return this.exists({
            id: tagId,
            ticket: { id: ticketId }
        } as any);
    }
}
