import { Command } from "./Command";
import { UseCaseResponse } from "./UseCaseResponse";

/**
 * Base interface for all use cases
 */
export interface UseCase<TCommand extends Command | null = Command, TResponse = any> {
  /**
   * Execute the use case with optional command
   */
  execute(command?: TCommand): Promise<UseCaseResponse<TResponse>>;
}