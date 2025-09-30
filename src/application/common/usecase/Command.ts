/**
 * Base interface for all commands
 * Commands are DTOs that encapsulate the input data for use cases
 */
export interface Command {
  /**
   * Validates the command data
   * @throws {InvalidCommandException} if validation fails
   */
  validate?(): void;
}

export const INVALID_PAYLOAD = 'INVALID_PAYLOAD';