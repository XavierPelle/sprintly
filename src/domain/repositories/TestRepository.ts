import { Repository } from "typeorm";
import { AbstractRepository } from "./AbstractRepository";
import { Test } from "../entities/Test";

export class TestRepository extends AbstractRepository<Test> {
  constructor(repository: Repository<Test>) {
    super(repository);
  }
}