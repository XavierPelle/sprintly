import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { Ticket } from "./Ticket";
import { User } from "./User";
import { BaseEntity } from "./BaseEntity";
import { Image } from "./Image";

@Entity()
export class Test extends BaseEntity {

    @Column("text")
    description: string;

    @OneToMany(() => Image, (image) => image.test)
    images: Image[];

    @Column({ default: false })
    isValidated: boolean;

    @ManyToOne(() => User, (user) => user.tests, { nullable: false })
    user: User;

    @ManyToOne(() => Ticket, (ticket) => ticket.tests, { nullable: false })
    ticket: Ticket;

}