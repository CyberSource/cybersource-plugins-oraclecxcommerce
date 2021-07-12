import ccRestClient from 'ccRestClient';
import * as $ from 'jquery';
import ko from 'knockout';
import { BASE_API_HOST, BASE_API_URL, Channels } from '../constants';

interface AjaxOptions {
  baseUrl?: string;
  method?: string;
  data?: any;
}

const getData = (method: string, params: any) =>
  method === 'post' ? { data: JSON.stringify(params) } : { data: params };

class OccClient {
  isPreview = ko.observable(false);
  channel = ko.pureComputed(() => (this.isPreview() ? Channels.PREVIEW : Channels.STOREFRONT));

  init(widget: OCC.WidgetViewModel) {
    this.isPreview(widget.isPreview());
  }

  ajaxRequest(
    path: string,
    { method = 'get', data = '', baseUrl = `${BASE_API_HOST}${BASE_API_URL}` }: AjaxOptions = {}
  ): JQuery.jqXHR {
    return $.ajax({
      url: `${baseUrl}/${path}`,
      method,
      dataType: 'json',
      contentType: 'application/json',
      headers: {
        channel: this.channel()
      },
      ...getData(method, data)
    });
  }

  loadPaymentMethods(): JQuery.jqXHR<OCC.PaymentMethodResponse> {
    return this.ajaxRequest('paymentMethods');
  }

  getCaptureContext(): JQuery.jqXHR<OCC.CaptureContext> {
    const { protocol, hostname, port } = window.location;
    return this.ajaxRequest('keys', {
      method: 'post',
      data: {
        targetOrigin: `${protocol}//${hostname}${port ? ':' + port : ''}`
      }
    });
  }

  generatePayerAuthJwt(orderData: any): JQuery.jqXHR<OCC.PayerAuthJwt> {
    return this.ajaxRequest('payerAuth/generateJwt', { method: 'post', data: orderData });
  }

  createApplePaySession(validationUrl: string): JQuery.jqXHR<OCC.ApplePaySessionData> {
    return this.ajaxRequest('applepay/validate', { method: 'post', data: { validationUrl } });
  }

  getCreditCardsForProfile() {
    return new Promise<OCC.SavedCardList>((resolve, reject) => {
      ccRestClient.request(
        'listCreditCards',
        {},
        (data: any) => resolve(data.items),
        (error) => reject(error)
      );
    });
  }
}

export default new OccClient();
