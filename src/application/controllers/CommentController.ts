import { Comment } from "../../domain/entities/Comment";
import { CommentRepository } from "../../domain/repositories/CommentRepository";
import { AbstractController } from "./AbstractController";

export class CommentController extends AbstractController<Comment> {
  constructor(repository: CommentRepository) {
    super(repository);
  }

  protected get CommentRepository(): CommentRepository {
    return this.repository as CommentRepository;
  }

}