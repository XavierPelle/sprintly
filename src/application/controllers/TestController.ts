import { FastifyReply, FastifyRequest } from "fastify";
import { Test } from "../../domain/entities/Test";
import { TestRepository } from "../../domain/repositories/TestRepository";
import { TicketRepository } from "../../domain/repositories/TicketRepository";
import { UserRepository } from "../../domain/repositories/UserRepository";
import { AbstractController } from "./AbstractController";
import { CreateTestForTicketUseCase } from "../usecase/test/createTest/CreateTestForTicketUseCase";
import { CreateTestForTicketCommand } from "../usecase/test/createTest/CreateTestForTicketCommand";
import { ValidateTestUseCase } from "../usecase/test/validateTest/ValidateTestUseCase";
import { ValidateTestCommand } from "../usecase/test/validateTest/ValidateTestCommand";

export class TestController extends AbstractController<Test> {
  constructor(
    repository: TestRepository,
    private readonly ticketRepository: TicketRepository,
    private readonly userRepository: UserRepository
  ) {
    super(repository);
  }

  protected get TestRepository(): TestRepository {
    return this.repository as TestRepository;
  }

  /**
   * POST /ticket/:ticketId - Create test for ticket
   */
  async createForTicket(
    request: FastifyRequest<{
      Params: { ticketId: string };
      Body: { description: string };
    }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const ticketId = Number(request.params.ticketId);
      const { description } = request.body;
      const userId = request.user!.userId; // From auth middleware

      const useCase = new CreateTestForTicketUseCase(
        this.TestRepository,
        this.ticketRepository,
        this.userRepository
      );

      const command = new CreateTestForTicketCommand(
        ticketId,
        userId,
        description
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
   * PATCH /:id/validate - Validate or reject test
   */
  async validateTest(
    request: FastifyRequest<{
      Params: { id: string };
      Body: { isValidated: boolean };
    }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const testId = Number(request.params.id);
      const { isValidated } = request.body;
      const validatedBy = request.user!.userId; // From auth middleware

      const useCase = new ValidateTestUseCase(
        this.TestRepository,
        this.userRepository
      );

      const command = new ValidateTestCommand(testId, isValidated, validatedBy);
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