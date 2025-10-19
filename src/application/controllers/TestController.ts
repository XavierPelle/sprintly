import { FastifyRequest, FastifyReply } from "fastify";
import { AbstractController } from "./AbstractController";
import { Test } from "../../domain/entities/Test";
import { TestRepository } from "../../domain/repositories/TestRepository";
import { TicketRepository } from "../../domain/repositories/TicketRepository";
import { UserRepository } from "../../domain/repositories/UserRepository";
import { ImageRepository } from "../../domain/repositories/ImageRepository";
import { CreateTestForTicketUseCase } from "../usecase/test/createTest/CreateTestForTicketUseCase";
import { CreateTestForTicketCommand } from "../usecase/test/createTest/CreateTestForTicketCommand";
import { ValidateTestUseCase } from "../usecase/test/validateTest/ValidateTestUseCase";
import { ValidateTestCommand } from "../usecase/test/validateTest/ValidateTestCommand";
import { ImageService } from "../../infrastructure/services/ImageService"

export class TestController extends AbstractController<Test> {
    private readonly testRepository: TestRepository;
    private readonly ticketRepository: TicketRepository;
    private readonly userRepository: UserRepository;
    private readonly imageRepository: ImageRepository;

    constructor(
        testRepository: TestRepository,
        ticketRepository: TicketRepository,
        userRepository: UserRepository,
        imageRepository: ImageRepository
    ) {
        super(testRepository);
        this.testRepository = testRepository;
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.imageRepository = imageRepository;
    }

    /**
     * POST /ticket/:ticketId - Create test for ticket
     */
    async createForTicket(
        request: FastifyRequest<{
            Params: { ticketId: string };
        }>,
        reply: FastifyReply
    ): Promise<void> {
        try {
            const ticketId = Number(request.params.ticketId);
            const userId = request.user!.userId;

            // Parser les données multipart
            const parts = request.parts();
            let description = '';
            let imageType = 'TEST_ATTACHMENT'; // Valeur par défaut
            const imageFiles: Array<{
                filename: string;
                mimetype: string;
                data: Buffer;
            }> = [];

            for await (const part of parts) {
                if (part.type === 'field' && part.fieldname === 'description') {
                    description = part.value as string;
                } else if (part.type === 'field' && part.fieldname === 'imageType') {
                    imageType = part.value as string;
                } else if (part.type === 'file' && part.fieldname === 'images') {
                    const buffer = await part.toBuffer();
                    imageFiles.push({
                        filename: part.filename,
                        mimetype: part.mimetype,
                        data: buffer
                    });
                }
            }

            const useCase = new CreateTestForTicketUseCase(
                this.testRepository,
                this.ticketRepository,
                this.userRepository,
                this.imageRepository,
                new ImageService()
            );

            const command = new CreateTestForTicketCommand(
                ticketId,
                userId,
                description,
                imageType, // Passer le type d'image
                imageFiles.length > 0 ? imageFiles : undefined
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
            const validatedBy = request.user!.userId;

            const useCase = new ValidateTestUseCase(
                this.testRepository,
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