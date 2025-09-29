import { 
  Entity, 
  Column, 
  OneToMany, 
} from "typeorm";
import { Ticket } from "./Ticket";
import { Comment } from "./Comment";
import { BaseEntity } from "./BaseEntity";

@Entity()
export class User extends BaseEntity {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  avatar: string;

  @OneToMany(() => Ticket, (ticket) => ticket.creator)
  createdTickets: Ticket[];

  @OneToMany(() => Ticket, (ticket) => ticket.assignee)
  assignedTickets: Ticket[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

}