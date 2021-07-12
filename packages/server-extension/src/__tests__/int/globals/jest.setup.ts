import { Logger } from 'winston';
import { gatewaySettingsResponse } from '../data/gatewaySettings';

const occClient = {
  init(_logger: Logger) {
    // Empty
  },

  getGatewaySettings(_options: any) {
    return Promise.resolve(gatewaySettingsResponse);
  },

  getOrder: jest.fn()
};

jest.mock('@server-extension/services/occ/occClient', () => occClient);
jest.setTimeout(7000);
