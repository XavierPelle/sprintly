import { FastifyReply, FastifyRequest } from "fastify";
import { Ticket } from "../../domain/entities/Ticket";
import { TicketRepository } from "../../domain/repositories/TicketRepository";
import { UserRepository } from "../../domain/repositories/UserRepository";
import { SprintRepository } from "../../domain/repositories/SprintRepository";
import { AbstractController } from "./AbstractController";
import { AssignTicketToUserUseCase } from "../usecase/ticket/assignTicket/AssignTicketToUserUseCase";
import { AssignTicketToUserCommand } from "../usecase/ticket/assignTicket/AssignTicketToUserCommand";
import { ChangeTicketStatusUseCase } from "../usecase/ticket/changeStatus/ChangeTicketStatusUseCase";
import { ChangeTicketStatusCommand } from "../usecase/ticket/changeStatus/ChangeTicketStatusCommand";
import { GetTicketDetailsUseCase } from "../usecase/ticket/getDetails/GetTicketDetailsUseCase";
import { GetTicketDetailsCommand } from "../usecase/ticket/getDetails/GetTicketDetailsCommand";
import { CreateTicketUseCase } from "../usecase/ticket/createTicket/CreateTicketUseCase";
import { CreateTicketCommand } from "../usecase/ticket/createTicket/CreateTicketCommand";
import { SearchTicketsUseCase } from "../usecase/ticket/searchTickets/SearchTicketsUseCase";
import { SearchTicketsCommand } from "../usecase/ticket/searchTickets/SearchTicketsCommand";
import { TicketStatus } from "../../domain/enums/TicketStatus";
import { TicketType } from "../../domain/enums/TicketType";
import { TicketPriority } from "../../domain/enums/TicketPriority";

export class TicketController extends AbstractController<Ticket> {
  constructor(
    repository: TicketRepository,
    private readonly userRepository: UserRepository,
    private readonly sprintRepository: SprintRepository
  ) {
    super(repository);
  }

  protected get TicketRepository(): TicketRepository {
    return this.repository as TicketRepository;
  }

  /**
   * POST /tickets/create - Create ticket with validation
   */
  async createTicket(
    request: FastifyRequest<{
      Body: {
        title: string;
        description: string;
        type: TicketType;
        difficultyPoints: number;
        priority: TicketPriority;
        assignee?: number;
        sprintId?: number;
        projectPrefix?: string;
      };
    }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const {
        title,
        description,
        type,
        priority,
        difficultyPoints,
        assignee,
        sprintId,
        projectPrefix
      } = request.body;

      const creatorId = request.user!.userId; // From auth middleware

      const useCase = new CreateTicketUseCase(
        this.TicketRepository,
        this.userRepository,
        this.sprintRepository
      );

      const command = new CreateTicketCommand(
        title,
        description,
        type,
        difficultyPoints,
        creatorId,
        priority,
        assignee,
        sprintId,
        projectPrefix || "PROJ"
      );

      const response = await useCase.execute(command);

      if (!response.isSuccess()) {
        return reply.status(response.getStatusCode()).send(response.toJSON());
      }

      reply.status(201).send(response.getData());
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /tickets/search - Advanced search
   */
  async searchTickets(
    request: FastifyRequest<{
      Querystring: {
        query?: string;
        status?: TicketStatus;
        type?: TicketType;
        assignee?: number;
        creatorId?: number;
        sprintId?: number;
        minPoints?: number;
        maxPoints?: number;
        sortBy?: 'createdAt' | 'updatedAt' | 'difficultyPoints' | 'key';
        sortOrder?: 'ASC' | 'DESC';
        page?: number;
        limit?: number;
      };
    }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const {
        query,
        status,
        type,
        assignee,
        creatorId,
        sprintId,
        minPoints,
        maxPoints,
        sortBy,
        sortOrder,
        page,
        limit
      } = request.query;

      const useCase = new SearchTicketsUseCase(this.TicketRepository);

      const command = new SearchTicketsCommand(
        query,
        status,
        type,
        assignee ? Number(assignee) : undefined,
        creatorId ? Number(creatorId) : undefined,
        sprintId ? Number(sprintId) : undefined,
        minPoints ? Number(minPoints) : undefined,
        maxPoints ? Number(maxPoints) : undefined,
        sortBy || 'createdAt',
        sortOrder || 'DESC',
        page ? Number(page) : 1,
        limit ? Number(limit) : 20
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
   * GET /tickets/:id/details - Get complete ticket details
   */
  async getDetails(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const ticketId = Number(request.params.id);

      const useCase = new GetTicketDetailsUseCase(this.TicketRepository);
      const command = new GetTicketDetailsCommand(ticketId);
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
   * PATCH /tickets/:id/assign - Assign ticket to user
   */
  async assignToUser(
    request: FastifyRequest<{
      Params: { id: string };
      Body: { userId: number | null };
    }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const ticketId = Number(request.params.id);
      const { userId } = request.body;

      const useCase = new AssignTicketToUserUseCase(
        this.TicketRepository,
        this.userRepository
      );

      const command = new AssignTicketToUserCommand(ticketId, userId);
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
   * PATCH /tickets/:id/status - Change ticket status
   */
  async changeStatus(
    request: FastifyRequest<{
      Params: { id: string };
      Body: { status: TicketStatus };
    }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const ticketId = Number(request.params.id);
      const { status } = request.body;

      const useCase = new ChangeTicketStatusUseCase(this.TicketRepository);
      const command = new ChangeTicketStatusCommand(ticketId, status);
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