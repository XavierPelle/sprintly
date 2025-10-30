import { Column, Entity, ManyToOne, Index } from "typeorm";
import { Ticket } from "./Ticket";
import { User } from "./User";
import { BaseEntity } from "./BaseEntity";
import { TicketStatus } from "../enums/TicketStatus";

@Entity()
@Index(['ticket', 'createdAt'])
@Index(['ticket', 'toStatus'])
export class TicketHistory extends BaseEntity {

  @ManyToOne(() => Ticket, { nullable: false, onDelete: "CASCADE" })
  ticket: Ticket;

  @Column({ type: "enum", enum: TicketStatus, nullable: true })
  fromStatus: TicketStatus | null;

  @Column({ type: "enum", enum: TicketStatus })
  toStatus: TicketStatus;

  @ManyToOne(() => User, { nullable: true })
  changedBy: User | null;

  @Column({ type: "timestamp", nullable: true })
  startedAt: Date | null; 

  @Column({ type: "timestamp" })
  completedAt: Date;

  @Column({ type: "int", nullable: true })
  durationSeconds: number; 
}