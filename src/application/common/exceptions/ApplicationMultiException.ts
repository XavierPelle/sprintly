/**
 * Multi Exception (one exception with multiple messages)
 */
export class ApplicationMultiException extends Error {
  constructor(
    message: string,
    private readonly translationParams: Record<string, any> = {}
  ) {
    super(message);
    this.name = 'ApplicationMultiException';
  }

  getTranslationParameters(): Record<string, any> {
    return this.translationParams;
  }
}
