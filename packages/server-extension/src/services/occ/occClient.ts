import CommerceSDK from "@isv-occ-payment/occ-sdk";
import nconf from "nconf";
import { Logger } from "winston";

export class OccClient {
  sdk!: CommerceSDK;

  init(logger: Logger) {
    this.sdk = new CommerceSDK({
      hostname: nconf.get("atg.server.admin.url"),
      apiKey: nconf.get("atg.application.credentials:atg.application.token"),
      logger: logger,
    });
  }

  getGatewaySettings(): Promise<OCC.GatewaySettingsResponse> {
    return this.requestGET({
      url: "/ccadmin/v1/sitesettings/isv-occ-gateway",
    });
  }

  getOrder(orderId: string): Promise<OCC.OrderDataResponse> {
    return this.requestGET({
      url: `/ccadmin/v1/orders/${orderId}`,
    });
  }

  getCardTypes(): Promise<Record<string, any>> {
    return this.requestGET({
      url: `/ccstore/v1/payment/types`,
    });
  }

  updateExtensionVariable(variableDetails: any,id: string): Promise<Record<string, any>> {
    return this.requestPUT({
      data: variableDetails,
      url: `/ccadmin/v1/extensionEnvironmentVariables/${id}`,
    });
  }

  createExtensionVariable(variableDetails: any): Promise<Record<string, any>> {
    return this.requestPOST({
      data: variableDetails,
      url: `/ccadmin/v1/extensionEnvironmentVariables`,
    });
  }
  
  getAllExtensionVariable(): Promise<Record<string, any>> {
    return this.requestGET({
      url: `/ccadmin/v1/extensionEnvironmentVariables`,
    });
  }

  requestPOST(options: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.sdk.post({
        callback: (err: any, res: any) => {
          Boolean(err) ? reject(err) : resolve(res);
        },
        ...options,
      });
    });
  }

  requestPUT(options: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.sdk.put({
        callback: (err: any, res: any) => {
          Boolean(err) ? reject(err) : resolve(res);
        },
        ...options,
      });
    });
  }

  requestGET(options: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.sdk.get({
        callback: (err: any, res: any) => {
          Boolean(err) ? reject(err) : resolve(res);
        },
        ...options,
      });
    });
  }
}

export default new OccClient();
