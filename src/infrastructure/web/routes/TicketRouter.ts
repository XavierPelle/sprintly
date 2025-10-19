import { FastifyInstance } from "fastify";
import { TicketController } from "../../../application/controllers/TicketController";
import { Ticket } from "../../../domain/entities/Ticket";
import { AbstractRouter } from "./AbstractRouter";
import { authMiddleware } from "../middlewares/AuthMiddleware";

export class TicketRouter extends AbstractRouter<Ticket> {
    constructor(controller: TicketController) {
        super(controller);
    }

    protected get TicketController(): TicketController {
        return this.controller as TicketController;
    }

    protected async addCustomRoutes(fastify: FastifyInstance): Promise<void> {
        // POST /tickets/create - Create ticket with validation
        fastify.post(
            "/create",
            { onRequest: [authMiddleware] },
            this.TicketController.createTicket.bind(this.TicketController)
        );

        // GET /tickets/search - Advanced search
        fastify.get(
            "/search",
            { onRequest: [authMiddleware] },
            this.TicketController.searchTickets.bind(this.TicketController)
        );

        // GET /tickets/:id/details - Get complete ticket details
        fastify.get(
            "/:id/details",
            { onRequest: [authMiddleware] },
            this.TicketController.getDetails.bind(this.TicketController)
        );

        // PATCH /tickets/:id/assign - Assign ticket to user
        fastify.patch(
            "/:id/assign",
            { onRequest: [authMiddleware] },
            this.TicketController.assignToUser.bind(this.TicketController)
        );

        // PATCH /tickets/:id/status - Change ticket status
        fastify.patch(
            "/:id/status",
            { onRequest: [authMiddleware] },
            this.TicketController.changeStatus.bind(this.TicketController)
        );

        // POST /tickets/:id/tags - Add a tag to a ticket
        fastify.post(
            "/:id/tags",
            { onRequest: [authMiddleware] },
            this.TicketController.addTag.bind(this.TicketController)
        );

        // DELETE /tickets/:id/tags/:tagId - Remove a tag from a ticket
        fastify.delete(
            "/:id/tags/:tagId",
            { onRequest: [authMiddleware] },
            this.TicketController.removeTag.bind(this.TicketController)
        );

        fastify.get(
            "/tags",
            { onRequest: [authMiddleware] },
            this.TicketController.getAllTags.bind(this.TicketController)
        );
    }
}
