import occClient from './occClient';
import { Logger } from 'winston';

const { LogFactory } = require('@isv-occ-payment/occ-payment-factory');
const logger: Logger = LogFactory.logger();

export interface TokenValidationResult {
  valid: boolean;
  adminId?: string;
  error?: string;
}

export async function validateOccToken(
  token: string,
  siteId: string
): Promise<TokenValidationResult> {
  try {
    if (!token || typeof token !== 'string' || token.trim() === ''|| !siteId || typeof siteId !== 'string' || siteId.trim() === '' ) {
        return {
          valid: false,
          error: 'Token is empty or invalid format'
        };
    }

    const response = await occClient.requestPOST({
      url: '/ccadmin/v1/verify',
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-ccsite': siteId
      }
    });

    const body = response && response.body ? response.body : response;
    if (body && body.success === true) {
      return {
        valid: true,
      };
    }else{
       return {
        valid: false,
        error: body.message || body.devMessage || body.errorCode || 'Token validation failed'
      };
    }
   
  } catch (error: any) {
    logger.debug(`Admin token validation failed: ${error.message}`);
    return {
      valid: false,
      error: error.message || 'Token validation failed'
    };
  }
}

export function validateAmount(amount: number, maxAllowed: number = 1000000): boolean {
  if (isNaN(amount) || amount <= 0) {
    return false;
  }
  if (amount > maxAllowed) {
    return false;
  }
  return true;
}