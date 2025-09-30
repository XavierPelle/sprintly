import { FastifyInstance } from "fastify";
import { ImageController } from "../../../application/controllers/ImageController";
import { Image } from "../../../domain/entities/Image";
import { AbstractRouter } from "./AbstractRouter";
import { authMiddleware } from "../middlewares/AuthMiddleware";

export class ImageRouter extends AbstractRouter<Image> {
  constructor(controller: ImageController) {
    super(controller);
  }

  protected get ImageController(): ImageController {
    return this.controller as ImageController;
  }

  protected async addCustomRoutes(fastify: FastifyInstance): Promise<void> {
    // POST /images/upload - Upload an image
    fastify.post(
      "/upload",
      { onRequest: [authMiddleware] },
      this.ImageController.upload.bind(this.ImageController)
    );

    // DELETE /images/:id/file - Delete image with file
    fastify.delete(
      "/:id/file",
      { onRequest: [authMiddleware] },
      this.ImageController.deleteWithFile.bind(this.ImageController)
    );
  }
}