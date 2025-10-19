import {AbstractUseCase} from "../../../common/usecase/AbstractUseCase";
import {CreateTestForTicketCommand} from "./CreateTestForTicketCommand";
import {CreateTestForTicketResponse} from "./CreateTestForTicketResponse";
import {TestRepository} from "../../../../domain/repositories/TestRepository";
import {TicketRepository} from "../../../../domain/repositories/TicketRepository";
import {UserRepository} from "../../../../domain/repositories/UserRepository";
import {ImageRepository} from "../../../../domain/repositories/ImageRepository";
import {ApplicationException} from "../../../common/exceptions/ApplicationException";
import {ImageService} from "../../../../infrastructure/services/ImageService";
import {ImageType} from "../../../../domain/enums/ImageType";

/**
 * Use case to create a test for a ticket
 */
export class CreateTestForTicketUseCase extends AbstractUseCase <
    CreateTestForTicketCommand,
    CreateTestForTicketResponse
> {
    protected static commandClass = CreateTestForTicketCommand;

    constructor(
        private readonly testRepository: TestRepository,
        private readonly ticketRepository: TicketRepository,
        private readonly userRepository: UserRepository,
        private readonly imageRepository: ImageRepository,
        private readonly imageService: ImageService
    ) {
        super();
    }

    protected async doExecute(
        command: CreateTestForTicketCommand
    ): Promise<Partial<CreateTestForTicketResponse>> {

        const ticket = await this.ticketRepository.findById(command.ticketId);
        if (!ticket) {
            throw new ApplicationException('TICKET_NOT_FOUND', {
                ticketId: command.ticketId
            });
        }

        const user = await this.userRepository.findById(command.userId);
        if (!user) {
            throw new ApplicationException('USER_NOT_FOUND', {
                userId: command.userId
            });
        }

        const test = await this.testRepository.create({
            description: command.description.trim(),
            isValidated: false,
            user: {id: command.userId} as any,
            ticket: {id: command.ticketId} as any
        });

        const imageUrls: string[] = [];
        if (command.imageFiles && command.imageFiles.length > 0) {
            for (const imageFile of command.imageFiles) {
                try {
                    // Sauvegarder le fichier sur le disque
                    const filename = await this.imageService.saveImage(
                        imageFile.data,
                        imageFile.filename
                    );

                    // Créer l'entité Image avec TOUTES les informations requises
                    const image = await this.imageRepository.create({
                        url: this.imageService.getImageUrl(filename),
                        filename: filename, // Le nom du fichier sauvegardé
                        originalName: imageFile.filename, // Le nom original du fichier
                        mimeType: imageFile.mimetype, // Le type MIME
                        size: imageFile.data.length, // La taille en bytes
                        type: ImageType.TEST_ATTACHMENT,
                        test: {id: test.id} as any
                    });

                    imageUrls.push(image.url);
                } catch (error) {
                    console.error('Failed to save image:', error);
                    // Continue avec les autres images même si une échoue
                }
            }
        }

        return {
            id: test.id,
            ticketId: command.ticketId,
            ticketKey: ticket.key,
            userId: command.userId,
            userName: `${user.firstName} ${user.lastName}`,
            description: test.description,
            isValidated: test.isValidated,
            createdAt: test.createdAt,
            imageUrls,
            message: 'Test created successfully'
        };
    }
}