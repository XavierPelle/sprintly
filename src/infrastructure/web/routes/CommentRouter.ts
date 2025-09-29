import { CommentController } from "../../../application/controllers/CommentController";
import { Comment } from "../../../domain/entities/Comment";
import { AbstractRouter } from "./AbstractRouter";

export class CommentRouter extends AbstractRouter<Comment> {
  constructor(controller: CommentController) {
    super(controller);
  }

  protected get CommentController(): CommentController {
    return this.controller as CommentController;
  }
}