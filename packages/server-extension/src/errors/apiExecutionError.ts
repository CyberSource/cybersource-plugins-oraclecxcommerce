import { BaseError } from './baseError';

export interface ApiExecutionErrorData {
  api: string;
  operation: string;
  status: number;
  source: any;
}

export class ApiExecutionError extends BaseError {
  errorData: ApiExecutionErrorData;

  constructor(errorData: ApiExecutionErrorData) {
    super(`An error occurred during execution of ${errorData.api}:${errorData.operation}`);

    this.errorData = errorData;
  }

  get status(): number {
    return this.errorData.status;
  }
}
