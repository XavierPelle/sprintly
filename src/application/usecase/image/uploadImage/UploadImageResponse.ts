import { ImageType } from "../../../../domain/enums/ImageType";

export interface UploadImageResponse {
  id: number;
  url: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  displayOrder: number;
  type: ImageType;
  createdAt: Date;
  message: string;
}