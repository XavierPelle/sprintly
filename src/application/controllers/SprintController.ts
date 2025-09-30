import { FastifyReply, FastifyRequest } from "fastify";
import { Sprint } from "../../domain/entities/Sprint";
import { SprintRepository } from "../../domain/repositories/SprintRepository";
import { TicketRepository } from "../../domain/repositories/TicketRepository";
import { AbstractController } from "./AbstractController";
import { AddTicketsToSprintUseCase } from "../usecase/addTicketToSprint/AddTicketsToSprintUseCase";
import { RemoveTicketsFromSprintUseCase } from "../usecase/removeTicketFromSprint/removeTicketFromSprintUseCase";
import { AddTicketsToSprintCommand } from "../usecase/addTicketToSprint/AddTicketsToSprintCommand";
import { RemoveTicketsFromSprintCommand } from "../usecase/removeTicketFromSprint/removeTicketFromSprintCommand";

export class SprintController extends AbstractController<Sprint> {
  constructor(
    repository: SprintRepository,
    private readonly ticketRepository: TicketRepository
  ) {
    super(repository);
  }

  protected get SprintRepository(): SprintRepository {
    return this.repository as SprintRepository;
  }

  /**
   * POST /:id/tickets - Add tickets to a sprint
   */
  async addTickets(
    request: FastifyRequest<{
      Params: { id: string };
      Body: { ticketIds: number[] };
    }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const sprintId = Number(request.params.id);
      const { ticketIds } = request.body;

      if (!ticketIds || !Array.isArray(ticketIds)) {
        return reply.status(400).send({
          message: "ticketIds must be an array"
        });
      }

      const useCase = new AddTicketsToSprintUseCase(
        this.SprintRepository,
        this.ticketRepository
      );

      const command = new AddTicketsToSprintCommand(sprintId, ticketIds);
      const response = await useCase.execute(command);

      if (!response.isSuccess()) {
        return reply.status(response.getStatusCode()).send(response.toJSON());
      }

      reply.status(200).send(response.getData());
    } catch (error) {
      throw error;
    }
  }

  /**
   * DELETE /:id/tickets - Remove tickets from a sprint
   */
  async removeTickets(
    request: FastifyRequest<{
      Params: { id: string };
      Body: { ticketIds: number[] };
    }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const sprintId = Number(request.params.id);
      const { ticketIds } = request.body;

      if (!ticketIds || !Array.isArray(ticketIds)) {
        return reply.status(400).send({
          message: "ticketIds must be an array"
        });
      }

      const useCase = new RemoveTicketsFromSprintUseCase(
        this.SprintRepository,
        this.ticketRepository
      );

      const command = new RemoveTicketsFromSprintCommand(sprintId, ticketIds);
      const response = await useCase.execute(command);

      if (!response.isSuccess()) {
        return reply.status(response.getStatusCode()).send(response.toJSON());
      }

      reply.status(200).send(response.getData());
    } catch (error) {
      throw error;
    }
  }
}