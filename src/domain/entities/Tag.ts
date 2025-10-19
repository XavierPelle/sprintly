import { Column, Entity, ManyToOne } from "typeorm";
import { Ticket } from "./Ticket";
import { BaseEntity } from "./BaseEntity";

@Entity()
export class Tag extends BaseEntity {

    @Column()
    content: string;

    @Column()
    color: string;

    @ManyToOne(() => Ticket, (ticket) => ticket.tags)
    ticket: Ticket;

}