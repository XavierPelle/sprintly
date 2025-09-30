import { Image } from "../../domain/entities/Image";
import { ImageRepository } from "../../domain/repositories/ImageRepository";
import { AbstractController } from "./AbstractController";

export class ImageController extends AbstractController<Image> {
  constructor(repository: ImageRepository) {
    super(repository);
  }

  protected get ImageRepository(): ImageRepository {
    return this.repository as ImageRepository;
  }

}