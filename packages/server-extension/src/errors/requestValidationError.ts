import { Result, ValidationError } from 'express-validator';
import { BaseError } from './baseError';

export class RequestValidationError extends BaseError {
  errors: Result<ValidationError>;

  constructor(errors: Result<ValidationError>) {
    super('Request validation has failed. Please check your input');

    this.errors = errors;
  }
}
