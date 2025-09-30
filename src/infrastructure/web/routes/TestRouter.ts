import { TestController } from "../../../application/controllers/TestController";
import { Test } from "../../../domain/entities/Test";
import { AbstractRouter } from "./AbstractRouter";

export class TestRouter extends AbstractRouter<Test> {
  constructor(controller: TestController) {
    super(controller);
  }

  protected get TestController(): TestController {
    return this.controller as TestController;
  }
}