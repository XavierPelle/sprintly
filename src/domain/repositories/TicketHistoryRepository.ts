import { Repository } from "typeorm";
import { AbstractRepository } from "./AbstractRepository";
import { TicketHistory } from "../entities/TicketHistory";

export class TicketHistoryRepository extends AbstractRepository<TicketHistory> {
    constructor(repository: Repository<TicketHistory>) {
        super(repository);
    }
}
