/**
 * Base Application Exception
 */
export class ApplicationException extends Error {
  constructor(
    message: string,
    public readonly translationParams: Record<string, any> = {},
    public readonly code?: string
  ) {
    super(message);
    this.name = 'ApplicationException';
  }

  getTranslationParameters(): Record<string, any> {
    return this.translationParams;
  }
}