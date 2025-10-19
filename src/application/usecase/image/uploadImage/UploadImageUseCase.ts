import { AbstractUseCase } from "../../../common/usecase/AbstractUseCase";
import { UploadImageCommand } from "./UploadImageCommand";
import { UploadImageResponse } from "./UploadImageResponse";
import { ImageRepository } from "../../../../domain/repositories/ImageRepository";
import { TicketRepository } from "../../../../domain/repositories/TicketRepository";
import { TestRepository } from "../../../../domain/repositories/TestRepository";
import { UserRepository } from "../../../../domain/repositories/UserRepository";
import { ApplicationException } from "../../../common/exceptions/ApplicationException";
import { ImageType } from "../../../../domain/enums/ImageType";
import * as crypto from "crypto";
import * as path from "path";
import * as fs from "fs/promises";
import {ImageService} from "../../../../infrastructure/services/ImageService";

/**
 * Use case to upload an image
 */
export class UploadImageUseCase extends AbstractUseCase<
  UploadImageCommand,
  UploadImageResponse
> {
  protected static commandClass = UploadImageCommand;

  // Utiliser process.cwd() pour avoir le chemin absolu depuis la racine du projet
  private readonly UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
    constructor(
        private readonly imageRepository: ImageRepository,
        private readonly ticketRepository: TicketRepository,
        private readonly testRepository: TestRepository,
        private readonly userRepository: UserRepository,
        private readonly imageService: ImageService
    ) {
        super();
    }

    protected async doExecute(command: UploadImageCommand): Promise<Partial<UploadImageResponse>> {
        // Sauvegarder le fichier
        const filename = await this.imageService.saveImage(
            command.file.buffer,
            command.file.originalName
        );

        // Créer l'entité Image
        const image = await this.imageRepository.create({
            url: this.imageService.getImageUrl(filename),
            filename: filename,
            originalName: command.file.originalName,
            mimeType: command.file.mimeType,
            size: command.file.size,
            type: command.type,
            displayOrder: command.displayOrder,
            // Ajouter les relations selon le type
            ...(command.type === ImageType.TICKET_ATTACHMENT && { ticket: { id: command.entityId } as any }),
            ...(command.type === ImageType.TEST_ATTACHMENT && { test: { id: command.entityId } as any }),
            ...(command.type === ImageType.AVATAR && { user: { id: command.entityId } as any })
        });

        return {
            id: image.id,
            url: image.url,
            filename: image.filename,
            originalName: image.originalName,
            mimeType: image.mimeType,
            size: image.size,
            type: image.type,
            message: 'Image uploaded successfully'
        };
    }
}