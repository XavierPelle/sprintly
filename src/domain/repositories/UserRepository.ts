import { Repository } from "typeorm";
import { User } from "../entities/User";
import { AbstractRepository } from "./AbstractRepository";

export class UserRepository extends AbstractRepository<User> {
  constructor(repository: Repository<User>) {
    super(repository);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ email });
  }
}