import { Repository } from "typeorm";
import { AbstractRepository } from "./AbstractRepository";
import { Image } from "../entities/Image";

export class ImageRepository extends AbstractRepository<Image> {
    constructor(repository: Repository<Image>) {
        super(repository);
    }

    async findByTestId(testId: number): Promise<Image[]> {
        return this.repository.find({
            where: { test: { id: testId } }
        });
    }
}