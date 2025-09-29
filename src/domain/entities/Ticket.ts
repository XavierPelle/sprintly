import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  OneToMany, 
  CreateDateColumn,
  UpdateDateColumn
} from "typeorm";
import { TicketType } from "../enums/TicketType";
import { User } from "./User";
import { Comment } from "./Comment";
import { Sprint } from "./Sprint";


@Entity()
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  key: string;

  @Column()
  title: string;

  @Column("text")
  description: string;

  @Column({ nullable: true })
  image: string;

  @Column({ type: "enum", enum: TicketType, default: TicketType.TASK })
  type: TicketType;

  @Column({ default: 0 })
  difficultyPoints: number;

  @ManyToOne(() => User, (user) => user.createdTickets, { nullable: false })
  creator: User;

  @ManyToOne(() => User, (user) => user.assignedTickets, { nullable: true })
  assignee: User;

  @ManyToOne(() => Sprint, (sprint) => sprint.tickets, { nullable: true })
  sprint: Sprint;

  @OneToMany(() => Comment, (comment) => comment.ticket)
  comments: Comment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}