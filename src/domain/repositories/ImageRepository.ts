import { Repository } from "typeorm";
import { AbstractRepository } from "./AbstractRepository";
import { Image } from "../entities/Image";

export class ImageRepository extends AbstractRepository<Image> {
  constructor(repository: Repository<Image>) {
    super(repository);
  }
}