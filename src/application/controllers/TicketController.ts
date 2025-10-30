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
import { AddTagToTicketUseCase} from "../usecase/tag/AddTagToTicket/AddTagToTicketUseCase";
import {AddTagToTicketCommand} from "../usecase/tag/AddTagToTicket/AddTagToTicketCommand";
import {RemoveTagFromTicketCommand} from "../usecase/tag/RemoveTagFromTicket/RemoveTagFromTicketCommand";
import {RemoveTagFromTicketUseCase} from "../usecase/tag/RemoveTagFromTicket/RemoveTagFromTicketUseCase";
import {TagRepository} from "../../domain/repositories/TagRepository";
import { TicketHistoryRepository } from "../../domain/repositories/TicketHistoryRepository";


export class TicketController extends AbstractController<Ticket> {
  constructor(
    repository: TicketRepository,
    private readonly userRepository: UserRepository,
    private readonly sprintRepository: SprintRepository,
    private readonly tagRepository: TagRepository,
    private readonly ticketHistoryRepository: TicketHistoryRepository
  ) {
    super(repository);
  }

  protected get ticketRepository(): TicketRepository {
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

      const creatorId = request.user!.userId;

      const useCase = new CreateTicketUseCase(
        this.ticketRepository,
        this.userRepository,
        this.sprintRepository,
        this.ticketHistoryRepository
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

      const useCase = new SearchTicketsUseCase(this.ticketRepository);

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

      const useCase = new GetTicketDetailsUseCase(this.ticketRepository);
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
        this.ticketRepository,
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

      const useCase = new ChangeTicketStatusUseCase(this.ticketRepository,this.ticketHistoryRepository);
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

    /**
     * POST /tickets/:id/tags - Add a tag to a ticket
     */
    async addTag(
        request: FastifyRequest<{
            Params: { id: string };
            Body: { content: string; color: string };
        }>,
        reply: FastifyReply
    ): Promise<void> {
        try {
            const ticketId = Number(request.params.id);
            const { content, color } = request.body;

            const useCase = new AddTagToTicketUseCase(
                this.ticketRepository,
                this.tagRepository
            );

            const command = new AddTagToTicketCommand(ticketId, content, color);
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
     * DELETE /tickets/:id/tags/:tagId - Remove a tag from a ticket
     */
    async removeTag(
        request: FastifyRequest<{
            Params: { id: string; tagId: string };
        }>,
        reply: FastifyReply
    ): Promise<void> {
        try {
            const ticketId = Number(request.params.id);
            const tagId = Number(request.params.tagId);

            const useCase = new RemoveTagFromTicketUseCase(
                this.ticketRepository,
                this.tagRepository
            );

            const command = new RemoveTagFromTicketCommand(ticketId, tagId);
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
     * GET /tags - Get all unique tags with their usage count
     */
    async getAllTags(
        request: FastifyRequest,
        reply: FastifyReply
    ): Promise<void> {
        try {
            const tags = await this.tagRepository.findAll({
                order: { content: 'ASC' }
            });

            const tagMap = new Map<string, { content: string; color: string; count: number }>();

            tags.forEach(tag => {
                const key = tag.content.toLowerCase();
                if (tagMap.has(key)) {
                    const existing = tagMap.get(key)!;
                    existing.count++;
                } else {
                    tagMap.set(key, {
                        content: tag.content,
                        color: tag.color,
                        count: 1
                    });
                }
            });

            const uniqueTags = Array.from(tagMap.values()).sort((a, b) => b.count - a.count);

            reply.status(200).send(uniqueTags);
        } catch (error) {
            throw error;
        }
    }
}