import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Ticket } from "./Ticket";
import { User } from "./User";

@Entity()
export class Comment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("text")
    description: string;

    @ManyToOne(() => User, (user) => user.comments, { nullable: false })
    user: User;

    @ManyToOne(() => Ticket, (ticket) => ticket.comments, { nullable: false })
    ticket: Ticket;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}