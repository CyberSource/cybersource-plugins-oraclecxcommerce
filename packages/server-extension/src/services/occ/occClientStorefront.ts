import CommerceSDK from '@isv-occ-payment/occ-sdk';

import nconf from 'nconf';
import { Logger } from 'winston';

export class OccClientStorefront {
  sdk!: CommerceSDK;

  init(logger: Logger) {
    this.sdk = new CommerceSDK({
      hostname: nconf.get('atg.server.url'),
      apiKey: nconf.get('atg.application.credentials:atg.application.token'),
      logger: logger
    });
  }

  getUserProfile(profileId: string): Promise<Record<string, any>> {
    return this.requestGET({
      url: `/ccapp/v1/profiles/${profileId}?fields=creditCards.cardProps,creditCards.id`
    });
  }

  getProfileWithCardDetails(token: string): Promise<Record<string, any>> {
    return this.requestGET({
      url: `/ccapp/v1/profiles`,
      data: {
        useAdvancedQParser: true,
        q: `creditCards.token eq "${token}"`
      }
    })
  }

  updateProfile(cardDetails: OCC.card[], profileID: string): Promise<Record<string, any>> {
    return this.requestPUT({
      data: { "creditCards": cardDetails },
      url: `/ccapp/v1/profiles/${profileID}`
    });
  }

  requestGET(options: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.sdk.get({
        callback: (err: any, res: any) => {
          Boolean(err) ? reject(err) : resolve(res);
        },
        ...options
      });
    });
  }

  requestPUT(options: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.sdk.put({
        callback: (err: any, res: any) => {
          Boolean(err) ? reject(err) : resolve(res);
        },
        ...options
      });
    });
  }

}

export default new OccClientStorefront();
