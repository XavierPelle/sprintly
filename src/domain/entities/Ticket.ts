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
import { Tag } from "./Tag";
import { TicketHistory } from "./TicketHistory";


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

  @Column({ default: false })
  isBlocked: boolean;

  @Column({ nullable: true })
  blockedReason: string;

  @Column({ nullable: true })
  pullRequestLink: string;

  @Column({ nullable: true })
  testLink: string;

  @Column({ nullable: true })
  branch: string;

  @ManyToOne(() => User, (user) => user.createdTickets, { nullable: false })
  creator: User;

  @Index()
  @ManyToOne(() => User, (user) => user.assignedTickets, { nullable: true })
  assignee: User;

  @ManyToOne(() => Sprint, (sprint) => sprint.tickets, { nullable: true })
  sprint: Sprint;

  @OneToMany(() => Comment, (comment) => comment.ticket)
  comments: Comment[];
  
  @OneToMany(() => Tag, (tag) => tag.ticket)
  tags: Tag[];

  @OneToMany(() => Test, (test) => test.ticket)
  tests: Test[];

  @OneToMany(() => TicketHistory, (history) => history.ticket)
  histories: TicketHistory[];
}