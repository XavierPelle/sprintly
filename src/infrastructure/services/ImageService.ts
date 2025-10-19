// src/infrastructure/services/ImageService.ts
import { promises as fs } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

export class ImageService {
    private uploadDir: string;

    constructor() {
        this.uploadDir = process.env.UPLOAD_DIR || join(process.cwd(), 'uploads');
        this.ensureUploadDirExists();
    }

    private async ensureUploadDirExists(): Promise<void> {
        try {
            await fs.access(this.uploadDir);
        } catch {
            await fs.mkdir(this.uploadDir, { recursive: true });
        }
    }

    async saveImage(buffer: Buffer, originalFilename: string): Promise<string> {
        const ext = originalFilename.split('.').pop() || 'jpg';
        const filename = `${randomUUID()}.${ext}`;
        const filepath = join(this.uploadDir, filename);

        await fs.writeFile(filepath, buffer);

        return filename;
    }

    async deleteImage(filename: string): Promise<void> {
        const filepath = join(this.uploadDir, filename);
        try {
            await fs.unlink(filepath);
        } catch (error) {
            console.error(`Failed to delete image ${filename}:`, error);
        }
    }

    getImageUrl(filename: string): string {
        return `/uploads/${filename}`;
    }
}