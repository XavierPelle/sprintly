import { FastifyReply, FastifyRequest } from "fastify";
import { TicketRepository } from "../../domain/repositories/TicketRepository";
import { UserRepository } from "../../domain/repositories/UserRepository";
import { SprintRepository } from "../../domain/repositories/SprintRepository";
import { TestRepository } from "../../domain/repositories/TestRepository";
import { CommentRepository } from "../../domain/repositories/CommentRepository";
import { GetProjectDashboardUseCase } from "../usecase/dashboard/getProjectDashboard/GetProjectDashboardUseCase";
import { GetProjectDashboardCommand } from "../usecase/dashboard/getProjectDashboard/GetProjectDashboardCommand";

/**
 * Controller for dashboard endpoints
 */
export class DashboardController {
  constructor(
    private readonly ticketRepository: TicketRepository,
    private readonly userRepository: UserRepository,
    private readonly sprintRepository: SprintRepository,
    private readonly testRepository: TestRepository,
    private readonly commentRepository: CommentRepository
  ) {}

  /**
   * GET /dashboard/project - Get project-wide dashboard
   */
  async getProjectDashboard(
    request: FastifyRequest<{
      Querystring: {
        includeHistorical?: boolean;
      };
    }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const includeHistorical = request.query.includeHistorical === true;

      const useCase = new GetProjectDashboardUseCase(
        this.ticketRepository,
        this.userRepository,
        this.sprintRepository,
        this.testRepository,
        this.commentRepository
      );

      const command = new GetProjectDashboardCommand(includeHistorical);
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