import { Test } from "../../domain/entities/Test";
import { TestRepository } from "../../domain/repositories/TestRepository";
import { AbstractController } from "./AbstractController";

export class TestController extends AbstractController<Test> {
  constructor(repository: TestRepository) {
    super(repository);
  }

  protected get TestRepository(): TestRepository {
    return this.repository as TestRepository;
  }

}