import { Command } from "../../../common/usecase/Command";
import { InvalidCommandException } from "../../../common/exceptions/InvalidCommandException";
import { ImageType } from "../../../../domain/enums/ImageType";

/**
 * Command to upload an image
 */
export class UploadImageCommand implements Command {
  constructor(
    public readonly file: {
      buffer: Buffer;
      originalName: string;
      mimeType: string;
      size: number;
    },
    public readonly type: ImageType,
    public readonly entityId: number | null,
    public readonly displayOrder: number = 0
  ) {}

  validate(): void {
    if (!this.file || !this.file.buffer) {
      throw new InvalidCommandException('File is required');
    }

    if (!this.file.originalName) {
      throw new InvalidCommandException('Original filename is required');
    }

    if (!this.file.mimeType) {
      throw new InvalidCommandException('MIME type is required');
    }

    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp'
    ];

    if (!allowedMimeTypes.includes(this.file.mimeType)) {
      throw new InvalidCommandException(
        `Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`
      );
    }

    const maxSize = 5 * 1024 * 1024;
    if (this.file.size > maxSize) {
      throw new InvalidCommandException('File size must not exceed 5MB');
    }

    if (!this.type) {
      throw new InvalidCommandException('Image type is required');
    }

    const validTypes = Object.values(ImageType);
    if (!validTypes.includes(this.type)) {
      throw new InvalidCommandException(
        `Invalid image type. Must be one of: ${validTypes.join(', ')}`
      );
    }

    if (
      (this.type === ImageType.TICKET_ATTACHMENT || 
       this.type === ImageType.TEST_ATTACHMENT) &&
      (!this.entityId || this.entityId <= 0)
    ) {
      throw new InvalidCommandException('Entity ID is required for attachments');
    }

    if (this.displayOrder < 0) {
      throw new InvalidCommandException('Display order must be non-negative');
    }
  }
}