
/**
 * Redirect Exception
 */
export class RedirectException extends Error {
  constructor(
    message: string,
    public readonly redirectUrl: string
  ) {
    super(message);
    this.name = 'RedirectException';
  }
}