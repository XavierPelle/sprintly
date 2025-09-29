import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Ticket } from "./Ticket";
import { User } from "./User";
import { BaseEntity } from "./BaseEntity";

@Entity()
export class Comment extends BaseEntity {

    @Column("text")
    description: string;

    @ManyToOne(() => User, (user) => user.comments, { nullable: false })
    user: User;

    @ManyToOne(() => Ticket, (ticket) => ticket.comments, { nullable: false })
    ticket: Ticket;

}