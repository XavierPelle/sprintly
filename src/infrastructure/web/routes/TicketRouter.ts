import { TicketController } from "../../../application/controllers/TicketController";
import { Ticket } from "../../../domain/entities/Ticket";
import { AbstractRouter } from "./AbstractRouter";

export class TicketRouter extends AbstractRouter<Ticket> {
  constructor(controller: TicketController) {
    super(controller);
  }

  protected get TicketController(): TicketController {
    return this.controller as TicketController;
  }
}