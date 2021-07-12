import { Response } from 'express';

export interface ErrorHandler<T> {
  supports(err: unknown): boolean;

  renderError(err: T, res: Response): void;
}
