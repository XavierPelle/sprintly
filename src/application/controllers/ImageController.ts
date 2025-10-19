import { FastifyReply, FastifyRequest } from "fastify";
import { Image } from "../../domain/entities/Image";
import { ImageRepository } from "../../domain/repositories/ImageRepository";
import { TicketRepository } from "../../domain/repositories/TicketRepository";
import { TestRepository } from "../../domain/repositories/TestRepository";
import { UserRepository } from "../../domain/repositories/UserRepository";
import { AbstractController } from "./AbstractController";
import { UploadImageUseCase } from "../usecase/image/uploadImage/UploadImageUseCase";
import { UploadImageCommand } from "../usecase/image/uploadImage/UploadImageCommand";
import { DeleteImageUseCase } from "../usecase/image/deleteImage/DeleteImageUseCase";
import { DeleteImageCommand } from "../usecase/image/deleteImage/DeleteImageCommand";
import { ImageType } from "../../domain/enums/ImageType";
import { ImageService } from "../../infrastructure/services/ImageService";

export class ImageController extends AbstractController<Image> {
    private readonly imageService: ImageService;

    constructor(
        repository: ImageRepository,
        private readonly ticketRepository: TicketRepository,
        private readonly testRepository: TestRepository,
        private readonly userRepository: UserRepository
    ) {
        super(repository);
        this.imageService = new ImageService();
    }

    protected get ImageRepository(): ImageRepository {
        return this.repository as ImageRepository;
    }

    /**
     * POST /images/upload - Upload an image
     * Expects multipart/form-data with file and metadata
     */
    async upload(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        try {
            const parts = request.parts();
            let fileData: any = null;
            let type: ImageType | null = null;
            let entityId: number | null = null;
            let displayOrder = 0;

            for await (const part of parts) {
                if (part.type === "file") {
                    const buffer = await part.toBuffer();
                    fileData = {
                        buffer,
                        originalName: part.filename,
                        mimeType: part.mimetype,
                        size: buffer.length
                    };
                } else {
                    const fieldName = part.fieldname;
                    const value = part.value as string;

                    if (fieldName === "type") {
                        if (!Object.values(ImageType).includes(value as ImageType)) {
                            return reply.status(400).send({ message: "Invalid image type" });
                        }
                        type = value as ImageType;
                    } else if (fieldName === "entityId") {
                        entityId = value ? Number(value) : null;
                    } else if (fieldName === "displayOrder") {
                        displayOrder = value ? Number(value) : 0;
                    }
                }
            }

            if (!fileData) {
                return reply.status(400).send({ message: "No file uploaded" });
            }

            if (!type) {
                return reply.status(400).send({ message: "Image type is required" });
            }

            const useCase = new UploadImageUseCase(
                this.ImageRepository,
                this.ticketRepository,
                this.testRepository,
                this.userRepository,
                this.imageService  // Passer ImageService au UseCase
            );

            const command = new UploadImageCommand(
                fileData,
                type,
                entityId,
                displayOrder
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
     * DELETE /images/:id/file - Delete image with file
     */
    async deleteWithFile(
        request: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply
    ): Promise<void> {
        try {
            const imageId = Number(request.params.id);

            // Récupérer l'image pour obtenir le nom du fichier
            const image = await this.ImageRepository.findById(imageId);
            if (!image) {
                return reply.status(404).send({ message: "Image not found" });
            }

            const useCase = new DeleteImageUseCase(
                this.ImageRepository,
                this.imageService  // Passer ImageService au UseCase
            );

            const command = new DeleteImageCommand(imageId);
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