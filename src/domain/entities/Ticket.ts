import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index
} from "typeorm";
import { TicketType } from "../enums/TicketType";
import { User } from "./User";
import { Comment } from "./Comment";
import { Sprint } from "./Sprint";
import { BaseEntity } from "./BaseEntity";
import { Test } from "./Test";
import { TicketStatus } from "../enums/TicketStatus";
import { Image } from "./Image";
import { TicketPriority } from "../enums/TicketPriority";


@Entity()
export class Ticket extends BaseEntity {

  @Index()
  @Column({ unique: true })
  key: string;

  @Column()
  title: string;

  @Column("text")
  description: string;

  @OneToMany(() => Image, (image) => image.ticket)
  images: Image[];

  @Index()
  @Column({ type: "enum", enum: TicketStatus, default: TicketStatus.TODO })
  status: TicketStatus;

  @Index()
  @Column({ type: "enum", enum: TicketPriority, default: TicketPriority.LOW })
  priority: TicketPriority;

  @Column({ type: "enum", enum: TicketType, default: TicketType.TASK })
  type: TicketType;

  @Column({ default: 0 })
  difficultyPoints: number;

  @ManyToOne(() => User, (user) => user.createdTickets, { nullable: false })
  creator: User;

  @Index()
  @ManyToOne(() => User, (user) => user.assignedTickets, { nullable: true })
  assignee: User;

  @ManyToOne(() => Sprint, (sprint) => sprint.tickets, { nullable: true })
  sprint: Sprint;

  @OneToMany(() => Comment, (comment) => comment.ticket)
  comments: Comment[];

  @OneToMany(() => Test, (test) => test.ticket)
  tests: Test[];
}