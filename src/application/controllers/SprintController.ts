import { FastifyReply, FastifyRequest } from "fastify";
import { Sprint } from "../../domain/entities/Sprint";
import { SprintRepository } from "../../domain/repositories/SprintRepository";
import { TicketRepository } from "../../domain/repositories/TicketRepository";
import { AbstractController } from "./AbstractController";
import { AddTicketsToSprintUseCase } from "../usecase/sprint/addTicketToSprint/AddTicketsToSprintUseCase";
import { RemoveTicketsFromSprintUseCase } from "../usecase/sprint/removeTicketFromSprint/removeTicketFromSprintUseCase";
import { GetSprintDetailsUseCase } from "../usecase/sprint/getDetails/GetSprintDetailsUseCase";
import { GetSprintBurndownUseCase } from "../usecase/sprint/getSprintBurndown/GetSprintBurndownUseCase";
import { CloseSprintUseCase } from "../usecase/sprint/closeSprint/CloseSprintUseCase";
import { AddTicketsToSprintCommand } from "../usecase/sprint/addTicketToSprint/AddTicketsToSprintCommand";
import { RemoveTicketsFromSprintCommand } from "../usecase/sprint/removeTicketFromSprint/removeTicketFromSprintCommand";
import { GetSprintDetailsCommand } from "../usecase/sprint/getDetails/GetSprintDetailsCommand";
import { GetSprintBurndownCommand } from "../usecase/sprint/getSprintBurndown/GetSprintBurndownCommand";
import { CloseSprintCommand } from "../usecase/sprint/closeSprint/CloseSprintCommand";

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
   * GET /sprints/:id/details - Get sprint details with stats
   */
  async getDetails(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const sprintId = Number(request.params.id);

      const useCase = new GetSprintDetailsUseCase(this.SprintRepository);
      const command = new GetSprintDetailsCommand(sprintId);
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
   * GET /sprints/:id/burndown - Get burndown chart data
   */
  async getBurndown(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const sprintId = Number(request.params.id);

      const useCase = new GetSprintBurndownUseCase(this.SprintRepository);
      const command = new GetSprintBurndownCommand(sprintId);
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
   * POST /sprints/:id/close - Close sprint
   */
  async closeSprint(
    request: FastifyRequest<{
      Params: { id: string };
      Body: {
        moveIncompleteTo?: number;
        removeIncomplete?: boolean;
      };
    }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const sprintId = Number(request.params.id);
      const { moveIncompleteTo, removeIncomplete } = request.body;

      const useCase = new CloseSprintUseCase(
        this.SprintRepository,
        this.ticketRepository
      );

      const command = new CloseSprintCommand(
        sprintId,
        moveIncompleteTo,
        removeIncomplete || false
      );
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
   * POST /sprints/:id/tickets - Add tickets to a sprint
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
   * DELETE /sprints/:id/tickets - Remove tickets from a sprint
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
      console.log('tickets to remove (controller):', ticketIds);
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