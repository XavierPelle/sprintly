import { Ticket } from "../../domain/entities/Ticket";
import { TicketRepository } from "../../domain/repositories/TicketRepository";
import { AbstractController } from "./AbstractController";

export class TicketController extends AbstractController<Ticket> {
  constructor(repository: TicketRepository) {
    super(repository);
  }

  protected get TicketRepository(): TicketRepository {
    return this.repository as TicketRepository;
  }

}