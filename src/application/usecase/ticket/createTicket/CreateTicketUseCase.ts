import { AbstractUseCase } from "../../../common/usecase/AbstractUseCase";
import { CreateTicketCommand } from "./CreateTicketCommand";
import { CreateTicketResponse } from "./CreateTicketResponse";
import { TicketRepository } from "../../../../domain/repositories/TicketRepository";
import { UserRepository } from "../../../../domain/repositories/UserRepository";
import { SprintRepository } from "../../../../domain/repositories/SprintRepository";
import { ApplicationException } from "../../../common/exceptions/ApplicationException";
import { TicketStatus } from "../../../../domain/enums/TicketStatus";
import GithubBranchUtils from "../../../Utils/GithubBranchUtils";


export class CreateTicketUseCase extends AbstractUseCase<
  CreateTicketCommand,
  CreateTicketResponse
> {
  protected static commandClass = CreateTicketCommand;

  constructor(
    private readonly ticketRepository: TicketRepository,
    private readonly userRepository: UserRepository,
    private readonly sprintRepository: SprintRepository
  ) {
    super();
  }

  protected async doExecute(
    command: CreateTicketCommand
  ): Promise<Partial<CreateTicketResponse>> {
    
    const creator = await this.userRepository.findById(command.creatorId);
    if (!creator) {
      throw new ApplicationException('USER_NOT_FOUND', { 
        userId: command.creatorId 
      });
    }

    let assignee = null;
    if (command.assignee) {
      assignee = await this.userRepository.findById(command.assignee);
      if (!assignee) {
        throw new ApplicationException('ASSIGNEE_NOT_FOUND', { 
          userId: command.assignee 
        });
      }
    }

    let sprint = null;
    if (command.sprintId) {
      sprint = await this.sprintRepository.findById(command.sprintId);
      if (!sprint) {
        throw new ApplicationException('SPRINT_NOT_FOUND', { 
          sprintId: command.sprintId 
        });
      }

      const sprintWithTickets = await this.sprintRepository.findOne(
        { id: command.sprintId },
        { relations: ['tickets'] }
      );

      const currentPoints = sprintWithTickets!.tickets.reduce(
        (sum, t) => sum + t.difficultyPoints, 
        0
      );

      if (currentPoints + command.difficultyPoints > sprintWithTickets!.maxPoints) {
        throw new ApplicationException('SPRINT_CAPACITY_EXCEEDED', {
          sprintId: command.sprintId,
          currentPoints,
          maxPoints: sprintWithTickets!.maxPoints,
          ticketPoints: command.difficultyPoints,
          availablePoints: sprintWithTickets!.maxPoints - currentPoints
        });
      }
    }

    const key = await this.generateUniqueKey(command.projectPrefix);
    const branchName = GithubBranchUtils.generateBranchName(key, command.title);
    const testLink = GithubBranchUtils.buildTestLinkFromBranch(branchName);

    const ticketData: any = {
      key,
      title: command.title.trim(),
      description: command.description.trim(),
      type: command.type,
      difficultyPoints: command.difficultyPoints,
      status: TicketStatus.TODO,
      creator: { id: command.creatorId },
      priority: command.priority,
      branch: branchName,
      testLink: testLink
    };

    if (command.assignee) {
      ticketData.assignee = { id: command.assignee };
    }

    if (command.sprintId) {
      ticketData.sprint = { id: command.sprintId };
    }

    const ticket = await this.ticketRepository.create(ticketData);

    return {
      id: ticket.id,
      key: ticket.key,
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      type: ticket.type,
      difficultyPoints: ticket.difficultyPoints,
      createdAt: ticket.createdAt,
      priority: ticket.priority,
      pullRequestLink: ticket.pullRequestLink,
      testLink: ticket.testLink,
      branch: ticket.branch,
      
      creator: {
        id: creator.id,
        firstName: creator.firstName,
        lastName: creator.lastName
      },
      
      assignee: assignee ? {
        id: assignee.id,
        firstName: assignee.firstName,
        lastName: assignee.lastName
      } : null,
      
      sprint: sprint ? {
        id: sprint.id,
        name: sprint.name
      } : null,
      
      message: 'Ticket created successfully'
    };
  }

  private async generateUniqueKey(prefix: string): Promise<string> {
    const allTickets = await this.ticketRepository.findAll();
    
    const ticketsWithPrefix = allTickets.filter(t => 
      t.key.startsWith(`${prefix}-`)
    );

    let maxNumber = 0;
    for (const ticket of ticketsWithPrefix) {
      const match = ticket.key.match(new RegExp(`^${prefix}-(\\d+)$`));
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNumber) {
          maxNumber = num;
        }
      }
    }

    const nextNumber = maxNumber + 1;
    const key = `${prefix}-${String(nextNumber).padStart(3, '0')}`;

    const exists = await this.ticketRepository.exists({ key });
    if (exists) {
      return this.generateUniqueKey(prefix);
    }

    return key;
  }
}