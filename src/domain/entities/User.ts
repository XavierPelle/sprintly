import {
  Entity,
  Column,
  OneToMany,
  JoinColumn,
  OneToOne,
} from "typeorm";
import { Ticket } from "./Ticket";
import { Comment } from "./Comment";
import { BaseEntity } from "./BaseEntity";
import { Test } from "./Test";
import { Image } from "./Image";

@Entity()
export class User extends BaseEntity {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column({ select: false })
  password: string;

  @OneToOne(() => Image, { nullable: true })
  @JoinColumn()
  avatar: Image;

  @OneToMany(() => Ticket, (ticket) => ticket.creator)
  createdTickets: Ticket[];

  @OneToMany(() => Ticket, (ticket) => ticket.assignee)
  assignedTickets: Ticket[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany(() => Test, (test) => test.user)
  tests: Test[];

}