import { Sprint } from "../../domain/entities/Sprint";
import { SprintRepository } from "../../domain/repositories/SprintRepository";
import { AbstractController } from "./AbstractController";

export class SprintController extends AbstractController<Sprint> {
  constructor(repository: SprintRepository) {
    super(repository);
  }

  protected get SprintRepository(): SprintRepository {
    return this.repository as SprintRepository;
  }

}