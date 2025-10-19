import { AbstractUseCase } from "../../../common/usecase/AbstractUseCase";
import { GetTicketDetailsCommand } from "./GetTicketDetailsCommand";
import { GetTicketDetailsResponse } from "./GetTicketDetailsResponse";
import { TicketRepository } from "../../../../domain/repositories/TicketRepository";
import { ApplicationException } from "../../../common/exceptions/ApplicationException";

/**
 * Use case to get complete ticket details with all relations
 */
export class GetTicketDetailsUseCase extends AbstractUseCase<
  GetTicketDetailsCommand,
  GetTicketDetailsResponse
> {
  protected static commandClass = GetTicketDetailsCommand;

  constructor(private readonly ticketRepository: TicketRepository) {
    super();
  }

  protected async doExecute(
    command: GetTicketDetailsCommand
  ): Promise<Partial<GetTicketDetailsResponse>> {
    
    const ticket = await this.ticketRepository.findOne(
      { id: command.ticketId },
      {
        relations: [
          'creator',
          'assignee',
          'sprint',
          'images',
          'comments',
          'comments.user',
          'tests',
            'tags' ,
          'tests.user',
            'tests.images'
        ],
        order: {
          images: { displayOrder: 'ASC' },
          comments: { createdAt: 'DESC' },
          tests: { createdAt: 'DESC' }
        }
      }
    );

    if (!ticket) {
      throw new ApplicationException('TICKET_NOT_FOUND', { 
        ticketId: command.ticketId 
      });
    }

    const validatedTests = ticket.tests.filter(test => test.isValidated).length;

    return {
      id: ticket.id,
      key: ticket.key,
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      type: ticket.type,
      difficultyPoints: ticket.difficultyPoints,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      priority: ticket.priority,
      pullRequestLink: ticket.pullRequestLink,
      testLink: ticket.testLink,
      branch: ticket.branch,
        isBlocked: ticket.isBlocked,
        blockedReason: ticket.blockedReason,
      
      creator: {
        id: ticket.creator.id,
        firstName: ticket.creator.firstName,
        lastName: ticket.creator.lastName,
        email: ticket.creator.email
      },
      
      assignee: ticket.assignee ? {
        id: ticket.assignee.id,
        firstName: ticket.assignee.firstName,
        lastName: ticket.assignee.lastName,
        email: ticket.assignee.email
      } : null,
      
      sprint: ticket.sprint ? {
        id: ticket.sprint.id,
        name: ticket.sprint.name,
        startDate: ticket.sprint.startDate,
        endDate: ticket.sprint.endDate
      } : null,
      
      images: ticket.images.map(img => ({
        id: img.id,
        url: img.url,
        filename: img.filename,
        displayOrder: img.displayOrder
      })),
      
      comments: ticket.comments.map(comment => ({
        id: comment.id,
        description: comment.description,
        createdAt: comment.createdAt,
        user: {
          id: comment.user.id,
          firstName: comment.user.firstName,
          lastName: comment.user.lastName
        }
      })),

      tags: ticket.tags.map(tag => ({
        id: tag.id,
        content: tag.content,
        color: tag.color
      })),

        tests: ticket.tests.map(test => ({
            id: test.id,
            description: test.description,
            isValidated: test.isValidated,
            createdAt: test.createdAt,
            images: test.images.map(img => ({
                id: img.id,
                url: img.url,
                filename: img.filename,
                displayOrder: img.displayOrder
            })),
            user: {
                id: test.user.id,
                firstName: test.user.firstName,
                lastName: test.user.lastName
            }
        })),
      
      stats: {
        totalComments: ticket.comments.length,
        totalTests: ticket.tests.length,
        validatedTests,
        totalImages: ticket.images.length
      }
    };
  }
}