/**
 * Invalid Form Exception
 */
export class InvalidFormException extends Error {
  constructor(
    message: string,
    private readonly form: any
  ) {
    super(message);
    this.name = 'InvalidFormException';
  }

  getForm(): any {
    return this.form;
  }
}