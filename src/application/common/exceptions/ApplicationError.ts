export class ApplicationError {
  constructor(
    private readonly message: string,
    private readonly originalException: Error,
    private readonly critical: boolean = false,
    private readonly code?: string
  ) {}

  getMessage(): string {
    return this.message;
  }

  getOriginalException(): Error {
    return this.originalException;
  }

  isCritical(): boolean {
    return this.critical;
  }

  getCode(): string | undefined {
    return this.code;
  }
}