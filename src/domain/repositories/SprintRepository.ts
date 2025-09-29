import { Repository } from "typeorm";
import { AbstractRepository } from "./AbstractRepository";
import { Sprint } from "../entities/Sprint";

export class SprintRepository extends AbstractRepository<Sprint> {
  constructor(repository: Repository<Sprint>) {
    super(repository);
  }
}