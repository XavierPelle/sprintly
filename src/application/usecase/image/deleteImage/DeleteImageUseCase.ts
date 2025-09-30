import { AbstractUseCase } from "../../../common/usecase/AbstractUseCase";
import { DeleteImageCommand } from "./DeleteImageCommand";
import { DeleteImageResponse } from "./DeleteImageResponse";
import { ImageRepository } from "../../../../domain/repositories/ImageRepository";
import { ApplicationException } from "../../../common/exceptions/ApplicationException";
import * as fs from "fs/promises";
import * as path from "path";

/**
 * Use case to delete an image from database and filesystem
 */
export class DeleteImageUseCase extends AbstractUseCase<
  DeleteImageCommand,
  DeleteImageResponse
> {
  protected static commandClass = DeleteImageCommand;

  private readonly UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

  constructor(private readonly imageRepository: ImageRepository) {
    super();
  }

  protected async doExecute(
    command: DeleteImageCommand
  ): Promise<Partial<DeleteImageResponse>> {
    
    const image = await this.imageRepository.findById(command.imageId);
    if (!image) {
      throw new ApplicationException('IMAGE_NOT_FOUND', { 
        imageId: command.imageId 
      });
    }

    const filename = image.filename;
    let fileDeleted = false;

    try {
      const filePath = path.join(this.UPLOAD_DIR, filename);
      
      try {
        await fs.access(filePath);
        await fs.unlink(filePath);
        fileDeleted = true;
      } catch (accessError) {
        console.warn(`File not found on filesystem: ${filePath}`);
      }
    } catch (error) {
      console.error(`Error deleting file ${filename}:`, error);
    }

    const deleted = await this.imageRepository.delete(command.imageId);
    if (!deleted) {
      throw new ApplicationException('IMAGE_DELETE_FAILED', { 
        imageId: command.imageId 
      });
    }

    return {
      imageId: command.imageId,
      filename,
      fileDeleted,
      message: fileDeleted 
        ? 'Image and file deleted successfully' 
        : 'Image deleted from database, but file was not found on filesystem'
    };
  }
}