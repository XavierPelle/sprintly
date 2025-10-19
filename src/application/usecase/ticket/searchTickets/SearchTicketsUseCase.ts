import { AbstractUseCase } from "../../../common/usecase/AbstractUseCase";
import { SearchTicketsCommand } from "./SearchTicketsCommand";
import { SearchTicketsResponse } from "./SearchTicketsResponse";
import { TicketRepository } from "../../../../domain/repositories/TicketRepository";
import { FindOptionsWhere, ILike } from "typeorm";
import { Ticket } from "../../../../domain/entities/Ticket";

/**
 * Use case to search tickets with advanced filters
 */
export class SearchTicketsUseCase extends AbstractUseCase<
  SearchTicketsCommand,
  SearchTicketsResponse
> {
  protected static commandClass = SearchTicketsCommand;

  constructor(private readonly ticketRepository: TicketRepository) {
    super();
  }

  protected async doExecute(
    command: SearchTicketsCommand
  ): Promise<Partial<SearchTicketsResponse>> {
    
    const where: FindOptionsWhere<Ticket> | FindOptionsWhere<Ticket>[] = {};

    if (command.query && command.query.trim().length > 0) {
      const searchTerm = command.query.trim();
      
      const orConditions: FindOptionsWhere<Ticket>[] = [
        { title: ILike(`%${searchTerm}%`) } as any,
        { description: ILike(`%${searchTerm}%`) } as any,
        { key: ILike(`%${searchTerm}%`) } as any
      ];

      // Apply other filters to each OR condition
      const baseFilters: any = {};
      if (command.status) baseFilters.status = command.status;
      if (command.type) baseFilters.type = command.type;
      if (command.assignee) baseFilters.assignee = { id: command.assignee };
      if (command.creatorId) baseFilters.creator = { id: command.creatorId };
      if (command.sprintId) baseFilters.sprint = { id: command.sprintId };

      return await this.searchWithOrConditions(orConditions, baseFilters, command);
    }

    if (command.status) {
      (where as any).status = command.status;
    }

    if (command.type) {
      (where as any).type = command.type;
    }

    if (command.assignee) {
      (where as any).assignee = { id: command.assignee };
    }

    if (command.creatorId) {
      (where as any).creator = { id: command.creatorId };
    }

    if (command.sprintId) {
      (where as any).sprint = { id: command.sprintId };
    }

    const allTickets = await this.ticketRepository.findBy(
      where as FindOptionsWhere<Ticket>,
      {
        relations: ['creator', 'assignee', 'sprint', 'tags'],
        order: { [command.sortBy]: command.sortOrder }
      }
    );

    let filteredTickets = allTickets;
    if (command.minPoints !== undefined || command.maxPoints !== undefined) {
      filteredTickets = allTickets.filter(ticket => {
        if (command.minPoints !== undefined && ticket.difficultyPoints < command.minPoints) {
          return false;
        }
        if (command.maxPoints !== undefined && ticket.difficultyPoints > command.maxPoints) {
          return false;
        }
        return true;
      });
    }

    const total = filteredTickets.length;
    const skip = (command.page - 1) * command.limit;
    const paginatedTickets = filteredTickets.slice(skip, skip + command.limit);

    const totalPages = Math.ceil(total / command.limit);

    return {
      tickets: paginatedTickets.map(ticket => ({
        id: ticket.id,
        key: ticket.key,
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        type: ticket.type,
        difficultyPoints: ticket.difficultyPoints,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
        pullRequestLink: ticket.pullRequestLink,
        testLink: ticket.testLink,
        priority: ticket.priority,
        isBlocked: ticket.isBlocked,
        blockedReason: ticket.blockedReason,

      tags: ticket.tags.map(tag => ({ 
        id: tag.id,
        name: tag.content,
        color: tag.color
      })),
        
        creator: {
          id: ticket.creator.id,
          firstName: ticket.creator.firstName,
          lastName: ticket.creator.lastName
        },
        
        assignee: ticket.assignee ? {
          id: ticket.assignee.id,
          firstName: ticket.assignee.firstName,
          lastName: ticket.assignee.lastName
        } : null,
        
        sprint: ticket.sprint ? {
          id: ticket.sprint.id,
          name: ticket.sprint.name
        } : null
      })),

      pagination: {
        page: command.page,
        limit: command.limit,
        total,
        totalPages,
        hasNext: command.page < totalPages,
        hasPrev: command.page > 1
      },

      filters: {
        query: command.query,
        status: command.status,
        type: command.type,
        assignee: command.assignee,
        creatorId: command.creatorId,
        sprintId: command.sprintId,
        minPoints: command.minPoints,
        maxPoints: command.maxPoints
      }
    };
  }

  /**
   * Helper method to search with OR conditions (for text search)
   */
  private async searchWithOrConditions(
    orConditions: FindOptionsWhere<Ticket>[],
    baseFilters: any,
    command: SearchTicketsCommand
  ): Promise<Partial<SearchTicketsResponse>> {
    
    // Apply base filters to each OR condition
    const finalConditions = orConditions.map(condition => ({
      ...condition,
      ...baseFilters
    }));

    // Execute searches for each condition
    const allResults: Ticket[] = [];
    const seenIds = new Set<number>();

    for (const condition of finalConditions) {
      const results = await this.ticketRepository.findBy(
        condition,
        {
          relations: ['creator', 'assignee', 'sprint'],
          order: { [command.sortBy]: command.sortOrder }
        }
      );

      // Deduplicate
      for (const ticket of results) {
        if (!seenIds.has(ticket.id)) {
          seenIds.add(ticket.id);
          allResults.push(ticket);
        }
      }
    }

    // Filter by difficulty points
    let filteredTickets = allResults;
    if (command.minPoints !== undefined || command.maxPoints !== undefined) {
      filteredTickets = allResults.filter(ticket => {
        if (command.minPoints !== undefined && ticket.difficultyPoints < command.minPoints) {
          return false;
        }
        if (command.maxPoints !== undefined && ticket.difficultyPoints > command.maxPoints) {
          return false;
        }
        return true;
      });
    }

    // Sort results
    filteredTickets.sort((a, b) => {
      const aVal = a[command.sortBy];
      const bVal = b[command.sortBy];
      
      if (command.sortOrder === 'ASC') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });

    // Pagination
    const total = filteredTickets.length;
    const skip = (command.page - 1) * command.limit;
    const paginatedTickets = filteredTickets.slice(skip, skip + command.limit);

    const totalPages = Math.ceil(total / command.limit);

    return {
      tickets: paginatedTickets.map(ticket => ({
        id: ticket.id,
        key: ticket.key,
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        type: ticket.type,
        difficultyPoints: ticket.difficultyPoints,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
        pullRequestLink: ticket.pullRequestLink,
        testLink: ticket.testLink,
        priority: ticket.priority,
        isBlocked: ticket.isBlocked,
        blockedReason: ticket.blockedReason,

      tags: ticket.tags.map(tag => ({ 
        id: tag.id,
        name: tag.content,
        color: tag.color
      })),
        
        creator: {
          id: ticket.creator.id,
          firstName: ticket.creator.firstName,
          lastName: ticket.creator.lastName
        },
        
        assignee: ticket.assignee ? {
          id: ticket.assignee.id,
          firstName: ticket.assignee.firstName,
          lastName: ticket.assignee.lastName
        } : null,
        
        sprint: ticket.sprint ? {
          id: ticket.sprint.id,
          name: ticket.sprint.name
        } : null
      })),

      pagination: {
        page: command.page,
        limit: command.limit,
        total,
        totalPages,
        hasNext: command.page < totalPages,
        hasPrev: command.page > 1
      },

      filters: {
        query: command.query,
        status: command.status,
        type: command.type,
        assignee: command.assignee,
        creatorId: command.creatorId,
        sprintId: command.sprintId,
        minPoints: command.minPoints,
        maxPoints: command.maxPoints
      }
    };
  }
}