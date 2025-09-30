/**
 * Domain Validation Exception
 */
export class DomainValidationException extends Error {
  constructor(
    message: string,
    public readonly translationParams: Record<string, any> = {}
  ) {
    super(message);
    this.name = 'DomainValidationException';
  }

  getTranslationParameters(): Record<string, any> {
    return this.translationParams;
  }
}
