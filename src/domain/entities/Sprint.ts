import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    OneToMany, OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import { Ticket } from "./Ticket";
import { BaseEntity } from "./BaseEntity";

@Entity()
export class Sprint extends BaseEntity {

  @Column()
  name: string;

  @Column()
  maxPoints: number;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @OneToMany(() => Ticket, (ticket) => ticket.sprint)
  tickets: Ticket[];

}