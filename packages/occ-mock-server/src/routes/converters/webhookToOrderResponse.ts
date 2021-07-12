const paymentStateMapper: Record<string, string> = {
  '1000': 'AUTHORIZED',
  '4000': 'SETTLED',
  '9000': 'REJECTED'
};

const creditCardResponseMapper = (response: any) => {
  const { authorizationResponse } = response;
  const { customPaymentProperties, additionalProperties } = authorizationResponse;
  const customProperties = {};

  customPaymentProperties?.reduce(
    (result: any, name: string) => ((result[name] = additionalProperties[name]), result),
    customProperties
  );

  return [authorizationResponse.amount, authorizationResponse.responseCode, customProperties];
};

const genericResponseMapper = (webhookResponse: any) => [
  webhookResponse.amount,
  webhookResponse.response.code,
  {}
];

const webhookToOrder = (response: any) => {
  const [amount, responseCode, customProperties] = response.authorizationResponse
    ? creditCardResponseMapper(response)
    : genericResponseMapper(response);

  return {
    id: response.orderId,
    payments: [
      {
        paymentGroupId: 'pg70442',
        amount: amount,
        gatewayName: 'isv-occ-gateway',
        uiIntervention: null,
        paymentState: paymentStateMapper[responseCode],
        customPaymentProperties: {
          ...customProperties
        }
      }
    ]
  };
};

export default webhookToOrder;
