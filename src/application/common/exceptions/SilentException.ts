/**
 * Silent Exception (no error handling)
 */
export class SilentException extends Error {
  constructor(message: string = 'Silent exception') {
    super(message);
    this.name = 'SilentException';
  }
}