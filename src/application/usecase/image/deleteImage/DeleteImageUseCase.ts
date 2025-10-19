import { AbstractUseCase } from "../../../common/usecase/AbstractUseCase";
import { DeleteImageCommand } from "./DeleteImageCommand";
import { DeleteImageResponse } from "./DeleteImageResponse";
import { ImageRepository } from "../../../../domain/repositories/ImageRepository";
import { ApplicationException } from "../../../common/exceptions/ApplicationException";
import * as fs from "fs/promises";
import * as path from "path";
import {ImageService} from "../../../../infrastructure/services/ImageService";

/**
 * Use case to delete an image from database and filesystem
 */
export class DeleteImageUseCase extends AbstractUseCase<
  DeleteImageCommand,
  DeleteImageResponse
> {
  protected static commandClass = DeleteImageCommand;

  private readonly UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

    constructor(
        private readonly imageRepository: ImageRepository,
        private readonly imageService: ImageService
    ) {
        super();
    }

    protected async doExecute(command: DeleteImageCommand): Promise<Partial<DeleteImageResponse>> {
        const image = await this.imageRepository.findById(command.imageId);

        if (!image) {
            throw new ApplicationException('IMAGE_NOT_FOUND', { imageId: command.imageId });
        }

        if (image.filename) {
            await this.imageService.deleteImage(image.filename);
        }

        await this.imageRepository.delete(command.imageId);

        return {
            message: 'Image deleted successfully'
        };
    }
}