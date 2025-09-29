import { Repository } from "typeorm";
import { AbstractRepository } from "./AbstractRepository";
import { Ticket } from "../entities/Ticket";

export class TicketRepository extends AbstractRepository<Ticket> {
  constructor(repository: Repository<Ticket>) {
    super(repository);
  }
}