import { ImageController } from "../../../application/controllers/ImageController";
import { Image } from "../../../domain/entities/Image";
import { AbstractRouter } from "./AbstractRouter";

export class ImageRouter extends AbstractRouter<Image> {
  constructor(controller: ImageController) {
    super(controller);
  }

  protected get ImageController(): ImageController {
    return this.controller as ImageController;
  }
}