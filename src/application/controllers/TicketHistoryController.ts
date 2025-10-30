import { FastifyReply, FastifyRequest } from "fastify";
import { TicketHistory } from "../../domain/entities/TicketHistory";
import { TicketHistoryRepository } from "../../domain/repositories/TicketHistoryRepository";
import { AbstractController } from "./AbstractController";

export class TicketHistoryController extends AbstractController<TicketHistory> {
  constructor(
    repository: TicketHistoryRepository,
  ) {
    super(repository);
  }

  protected get ticketHistoryRepository(): TicketHistoryRepository {
    return this.repository as TicketHistoryRepository;
  }
}