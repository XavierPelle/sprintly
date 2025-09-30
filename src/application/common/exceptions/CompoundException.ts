/**
 * Compound Exception (multiple exceptions)
 */
export class CompoundException extends Error {
  constructor(private readonly exceptions: Error[]) {
    super('Multiple errors occurred');
    this.name = 'CompoundException';
  }

  getExceptions(): Error[] {
    return this.exceptions;
  }
}