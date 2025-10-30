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
export class CreateTestForTicketUseCase extends AbstractUseCase<
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
            // Parser les displayOrders
            let displayOrders: number[] = [];
            
            if (command.displayOrders) {
                try {
                    // Si c'est une string JSON, la parser
                    displayOrders = typeof command.displayOrders === 'string' 
                        ? JSON.parse(command.displayOrders)
                        : command.displayOrders;
                } catch (error) {
                    console.error('Failed to parse displayOrders:', error);
                    // Fallback: ordre par défaut basé sur l'index
                    displayOrders = command.imageFiles.map((_, index) => index + 1);
                }
            } else {
                // Si pas de displayOrders fournis, utiliser l'ordre par défaut
                displayOrders = command.imageFiles.map((_, index) => index + 1);
            }

            // Sécurité: vérifier la cohérence entre imageFiles et displayOrders
            if (displayOrders.length !== command.imageFiles.length) {
                console.warn(
                    `Mismatch between imageFiles (${command.imageFiles.length}) and displayOrders (${displayOrders.length}). Using default order.`
                );
                displayOrders = command.imageFiles.map((_, index) => index + 1);
            }

            // Traiter chaque image avec son displayOrder
            for (let i = 0; i < command.imageFiles.length; i++) {
                const imageFile = command.imageFiles[i];
                const displayOrder = displayOrders[i];

                try {
                    // Sauvegarder le fichier sur le disque
                    const filename = await this.imageService.saveImage(
                        imageFile.data,
                        imageFile.filename
                    );

                    // Créer l'entité Image avec TOUTES les informations requises + displayOrder
                    const image = await this.imageRepository.create({
                        url: this.imageService.getImageUrl(filename),
                        filename: filename,
                        originalName: imageFile.filename,
                        mimeType: imageFile.mimetype,
                        size: imageFile.data.length,
                        type: ImageType.TEST_ATTACHMENT,
                        displayOrder: displayOrder, // Ajout du displayOrder
                        test: {id: test.id} as any
                    });

                    imageUrls.push(image.url);
                } catch (error) {
                    console.error(`Failed to save image at index ${i} (displayOrder: ${displayOrder}):`, error);
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