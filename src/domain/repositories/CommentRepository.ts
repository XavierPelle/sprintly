import { Repository } from "typeorm";
import { AbstractRepository } from "./AbstractRepository";
import { Comment } from "../entities/Comment";

export class CommentRepository extends AbstractRepository<Comment> {
  constructor(repository: Repository<Comment>) {
    super(repository);
  }
}