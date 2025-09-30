import { ApplicationError } from "../exceptions/ApplicationError";
import { CompoundException } from "../exceptions/CompoundException";

/**
 * Response object for use cases
 * Encapsulates data, errors, warnings, and HTTP status
 */
export class UseCaseResponse<T = any> {
  private data: T = {} as T;
  private errors: ApplicationError[] = [];
  private warnings: string[] = [];
  private statusCode: number = 200;

  /**
   * Merge data into the response
   */
  mergeData(data: Partial<T>): this {
    this.data = { ...this.data, ...data };
    return this;
  }

  /**
   * Set complete data
   */
  setData(data: T): this {
    this.data = data;
    return this;
  }

  /**
   * Get response data
   */
  getData(): T {
    return this.data;
  }

  /**
   * Add an error to the response
   */
  addError(error: ApplicationError): this {
    this.errors.push(error);
    return this;
  }

  /**
   * Get all errors
   */
  getErrors(): ApplicationError[] {
    return this.errors;
  }

  /**
   * Check if response has errors
   */
  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  /**
   * Add a warning message
   */
  addWarning(warning: string): this {
    this.warnings.push(warning);
    return this;
  }

  /**
   * Merge multiple warnings
   */
  mergeWarnings(warnings: string[]): this {
    this.warnings.push(...warnings);
    return this;
  }

  /**
   * Get all warnings
   */
  getWarnings(): string[] {
    return this.warnings;
  }

  /**
   * Set HTTP status code
   */
  setStatusCode(code: number): this {
    this.statusCode = code;
    return this;
  }

  /**
   * Get HTTP status code
   */
  getStatusCode(): number {
    return this.statusCode;
  }

  /**
   * Check if response is successful (no errors)
   */
  isSuccess(): boolean {
    return this.errors.length === 0;
  }

  /**
   * Throw CompoundException if there are errors
   */
  throwCompoundException(): void {
    if (this.hasErrors()) {
      throw new CompoundException(
        this.errors.map(e => e.getOriginalException())
      );
    }
  }

  /**
   * Convert response to JSON
   */
  toJSON(): {
    success: boolean;
    data: T;
    errors: Array<{
      message: string;
      code?: string;
      isCritical: boolean;
    }>;
    warnings: string[];
    statusCode: number;
  } {
    return {
      success: this.isSuccess(),
      data: this.data,
      errors: this.errors.map(e => ({
        message: e.getMessage(),
        code: e.getCode(),
        isCritical: e.isCritical()
      })),
      warnings: this.warnings,
      statusCode: this.statusCode
    };
  }
}