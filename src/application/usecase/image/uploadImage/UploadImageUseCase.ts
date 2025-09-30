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

/**
 * Use case to upload an image
 */
export class UploadImageUseCase extends AbstractUseCase<
  UploadImageCommand,
  UploadImageResponse
> {
  protected static commandClass = UploadImageCommand;

  private readonly UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

  constructor(
    private readonly imageRepository: ImageRepository,
    private readonly ticketRepository: TicketRepository,
    private readonly testRepository: TestRepository,
    private readonly userRepository: UserRepository
  ) {
    super();
  }

  protected async doExecute(
    command: UploadImageCommand
  ): Promise<Partial<UploadImageResponse>> {
    
    if (command.type === ImageType.TICKET_ATTACHMENT) {
      const ticket = await this.ticketRepository.findById(command.entityId!);
      if (!ticket) {
        throw new ApplicationException('TICKET_NOT_FOUND', { 
          ticketId: command.entityId 
        });
      }
    } else if (command.type === ImageType.TEST_ATTACHMENT) {
      const test = await this.testRepository.findById(command.entityId!);
      if (!test) {
        throw new ApplicationException('TEST_NOT_FOUND', { 
          testId: command.entityId 
        });
      }
    } else if (command.type === ImageType.AVATAR && command.entityId) {
      const user = await this.userRepository.findById(command.entityId);
      if (!user) {
        throw new ApplicationException('USER_NOT_FOUND', { 
          userId: command.entityId 
        });
      }
    }

    const fileExtension = path.extname(command.file.originalName);
    const uniqueFilename = `${crypto.randomUUID()}${fileExtension}`;

    await fs.mkdir(this.UPLOAD_DIR, { recursive: true });

    const filePath = path.join(this.UPLOAD_DIR, uniqueFilename);
    await fs.writeFile(filePath, command.file.buffer);

    const fileUrl = `/uploads/${uniqueFilename}`;

    const imageData: any = {
      url: fileUrl,
      filename: uniqueFilename,
      originalName: command.file.originalName,
      mimeType: command.file.mimeType,
      size: command.file.size,
      displayOrder: command.displayOrder,
      type: command.type
    };

    if (command.type === ImageType.TICKET_ATTACHMENT) {
      imageData.ticket = { id: command.entityId };
    } else if (command.type === ImageType.TEST_ATTACHMENT) {
      imageData.test = { id: command.entityId };
    } else if (command.type === ImageType.AVATAR && command.entityId) {
      imageData.user = { id: command.entityId };
    }

    const image = await this.imageRepository.create(imageData);

    return {
      id: image.id,
      url: image.url,
      filename: image.filename,
      originalName: image.originalName,
      mimeType: image.mimeType,
      size: image.size,
      displayOrder: image.displayOrder,
      type: image.type,
      createdAt: image.createdAt,
      message: 'Image uploaded successfully'
    };
  }
}