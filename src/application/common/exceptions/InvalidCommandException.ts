/**
 * Invalid Command Exception
 */
export class InvalidCommandException extends Error {
  constructor(message: string = 'Invalid command') {
    super(message);
    this.name = 'InvalidCommandException';
  }
}