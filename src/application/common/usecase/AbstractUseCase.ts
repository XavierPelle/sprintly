import { Command } from "./Command";
import { UseCase } from "./UseCase";
import { UseCaseResponse } from "./UseCaseResponse";
import { ApplicationError } from "../exceptions/ApplicationError";
import { ApplicationException } from "../exceptions/ApplicationException";
import { ApplicationMultiException } from "../exceptions/ApplicationMultiException";
import { CompoundException } from "../exceptions/CompoundException";
import { DomainValidationException } from "../exceptions/DomainValidationException";
import { InvalidCommandException } from "../exceptions/InvalidCommandException";
import { InvalidFormException } from "../exceptions/InvalidFormException";
import { RedirectException } from "../exceptions/RedirectionException";
import { SilentException } from "../exceptions/SilentException";

/**
 * Abstract base class for all use cases
 * Provides error handling and response management
 */
export abstract class AbstractUseCase<TCommand extends Command | null = Command, TResponse = any>
  implements UseCase<TCommand, TResponse> {
  
  protected static commandClass: any = null;
  protected clearMissing: boolean = false;

  private static readonly INTERNAL_ERROR = 'INTERNAL_ERROR';
  public static readonly INVALID_COMMAND = 'INVALID_COMMAND';

  /**
   * Abstract method to be implemented by concrete use cases
   */
  protected abstract doExecute(command: TCommand): Promise<Partial<TResponse>>;

  /**
   * Validates and throws if command is null when required
   * Can still be used manually in specific cases if needed
   */
  protected throwIfCommandIsNull(command: TCommand, message?: string): asserts command is NonNullable<TCommand> {
    if (command === null || command === undefined) {
      throw new InvalidCommandException(message || 'This use case needs a command');
    }
  }

  /**
   * Main execution method with error handling
   */
  async execute(command?: TCommand): Promise<UseCaseResponse<TResponse>> {
    const constructor = (this.constructor as typeof AbstractUseCase);

    // Validate command type if commandClass is defined
    if (constructor.commandClass !== null) {
      // Command is required but not provided
      if (command === null || command === undefined) {
        throw new InvalidCommandException(
          `UseCase ${this.constructor.name} requires a command of type ${constructor.commandClass.name}`
        );
      }

      // Command is not the correct type
      if (!(command instanceof constructor.commandClass)) {
        throw new InvalidCommandException(
          `This use case needs a command of type ${constructor.commandClass.name}`
        );
      }

      // Validate command if it has a validate method
      if (typeof command.validate === 'function') {
        command.validate();
      }
    }

    const response = new UseCaseResponse<TResponse>();

    try {
      const data = await this.doExecute(command as TCommand);
      
      if (data && 'warnings' in data) {
        const { warnings, ...rest } = data as any;
        response.mergeWarnings(warnings);
        response.mergeData(rest);
      } else {
        response.mergeData(data);
      }
    } catch (error) {
      this.handleException(response, error as Error);
    }

    return response;
  }

  /**
   * Throws CompoundException if response has errors
   */
  protected throwCompoundExceptionFromResponse(response: UseCaseResponse<TResponse>): void {
    response.throwCompoundException();
  }

  /**
   * Handles exceptions and populates the response
   */
  protected handleException(response: UseCaseResponse<TResponse>, error: Error): void {
    // Silent exceptions are ignored
    if (error instanceof SilentException) {
      return;
    }

    // Redirect exceptions are re-thrown
    if (error instanceof RedirectException) {
      throw error;
    }

    // Prepare error message with translation prefix
    const errorMessage = error.message.startsWith('errors.') 
      ? error.message 
      : `errors.${error.message}`;

    // Handle different exception types
    if (error instanceof InvalidFormException) {
      response.mergeData({ form: error.getForm() } as any);
      response.addError(new ApplicationError(error.message, error, false));
    } 
    else if (error instanceof CompoundException) {
      // Handle compound exceptions recursively
      for (const subException of error.getExceptions()) {
        this.handleException(response, subException);
      }
    } 
    else if (error instanceof ApplicationException || error instanceof DomainValidationException) {
      response.addError(new ApplicationError(errorMessage, error));
    } 
    else if (error instanceof ApplicationMultiException) {
      response.addError(new ApplicationError(error.message, error));
    } 
    else {
      response.addError(new ApplicationError(errorMessage, error, true));
    }

    // Set appropriate HTTP status code
    const statusCode = this.getErrorStatusCode(error);
    response.setStatusCode(statusCode);
  }

  /**
   * Get HTTP status code from error
   */
  private getErrorStatusCode(error: Error): number {
    if ('statusCode' in error && typeof (error as any).statusCode === 'number') {
      return (error as any).statusCode;
    }
    return 400; // Bad Request by default
  }

  /**
   * Set clearMissing flag
   */
  setClearMissing(clearMissing: boolean): this {
    this.clearMissing = clearMissing;
    return this;
  }
}