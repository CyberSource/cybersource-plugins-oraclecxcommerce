export class BaseError extends Error {
  public readonly name: string;

  constructor(message: string) {
    super(message);

    this.name = this.constructor.name;

    // Capturing stack trace, excluding constructor call from it.
    Error.captureStackTrace(this, this.constructor);
  }
}
