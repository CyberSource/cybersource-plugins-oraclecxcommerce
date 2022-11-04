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
    var message = '';
    var details;
    var errorMessage =`An error occurred during execution of ${errorData.api} : ${errorData.operation}`;
    if (errorData.source?.message) {
      message = errorData.source.message;
      details = errorData.source.details ? errorData.source.details : '';
      errorData.source.details ?  errorMessage += `, StatusCode: ${errorData.status}, Error: ${message}, Details: ${JSON.stringify(details)}`: errorMessage += `, StatusCode: ${errorData.status}, Error: ${message}`;
    } else if(errorData.source?.response?.rmsg){
      message = errorData.source.response.rmsg;
      errorMessage += `, StatusCode: ${errorData.status}, Error: ${message}`;
    }
    super(errorMessage);
    this.errorData = errorData;
  }

  get status(): number {
    return this.errorData.status;
  }
}
