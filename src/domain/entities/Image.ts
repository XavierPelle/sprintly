import { Column, Entity, ManyToOne } from "typeorm";
import { Ticket } from "./Ticket";
import { User } from "./User";
import { Test } from "./Test";
import { BaseEntity } from "./BaseEntity";
import { ImageType } from "../enums/ImageType";

@Entity()
export class Image extends BaseEntity {

    @Column()
    url: string;

    @Column()
    filename: string;

    @Column({ nullable: true })
    originalName: string;

    @Column({ nullable: true })
    mimeType: string;

    @Column({ nullable: true })
    size: number;

    @Column({ default: 0 })
    displayOrder: number;

    @Column({ type: "enum", enum: ImageType })
    type: ImageType;

    @ManyToOne(() => Ticket, (ticket) => ticket.images, {
        nullable: true,
        onDelete: "CASCADE"
    })
    ticket: Ticket;

    @ManyToOne(() => Test, (test) => test.images, {
        nullable: true,
        onDelete: "CASCADE"
    })
    test: Test;

    @ManyToOne(() => User, (user) => user.avatar, {
        nullable: true,
        onDelete: "CASCADE"
    })
    user: User;

}