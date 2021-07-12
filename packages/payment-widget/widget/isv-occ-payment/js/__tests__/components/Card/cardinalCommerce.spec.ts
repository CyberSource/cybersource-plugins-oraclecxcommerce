import CardinalCommerce from '@payment-widget/components/Card/paymentAuthentication/cardinalCommerce';
import { getOrderData } from '@payment-widget/components/Card/paymentAuthentication/payerAuthRequestBuilder';
import occClient from '@payment-widget/services/occClient';
import { mockDeep } from 'jest-mock-extended';
import { mocked } from 'ts-jest/utils';

jest.mock('@payment-widget/services/occClient');
jest.mock('@payment-widget/components/Card/paymentAuthentication/payerAuthRequestBuilder');

const Cardinal = mockDeep<CardinalAPI>();
(<any>global).Cardinal = Cardinal;

const ORDER_DATA = {};

describe('Payment Component - Card:CardinalCommerce', () => {
  let cardinal!: CardinalCommerce;
  const JWT = mockDeep<OCC.PayerAuthJwt>();

  beforeEach(async () => {
    cardinal = new CardinalCommerce();

    mocked(getOrderData).mockReturnValueOnce(ORDER_DATA);
    mocked(occClient.generatePayerAuthJwt).mockResolvedValueOnce(JWT);

    await cardinal.setup();
    await cardinal.initiate();
  });

  it('should setup CardinalCommerce by initiating payer auth JWT generation', async () => {
    expect(Cardinal.on).toHaveBeenCalledWith('payments.setupComplete', expect.any(Function));
    expect(Cardinal.on).toHaveBeenCalledWith('payments.validated', expect.any(Function));
    expect(occClient.generatePayerAuthJwt).toHaveBeenCalledWith(ORDER_DATA);
    expect(Cardinal.setup).toHaveBeenCalledWith('init', JWT);
  });

  it('should validate payment by triggering consumer authentication', () => {
    cardinal.validatePayment({
      acsUrl: 'acsUrl',
      pareq: 'pareq',
      authenticationTransactionId: 'authenticationTransactionId'
    });

    expect(Cardinal.continue).toHaveBeenCalledWith(
      'cca',
      expect.objectContaining({
        AcsUrl: 'acsUrl',
        Payload: 'pareq'
      }),
      expect.objectContaining({
        OrderDetails: {
          TransactionId: 'authenticationTransactionId'
        }
      })
    );
  });

  it('should update bin (first unmasked 6 PAN digits)', () => {
    cardinal.updateBin('411111');

    expect(Cardinal.trigger).toHaveBeenCalledWith('bin.process', '411111');
  });

  it('should complete setup be providing referenceId', async () => {
    cardinal.onSetupComplete({
      sessionId: 'sessionId'
    });

    expect(await cardinal.referenceId).toEqual('sessionId');
  });

  it('should provide auth token once consumer authentication is finished', () => {
    cardinal.onValidated(
      {
        ErrorNumber: 0
      },
      'authJwt'
    );

    return expect(cardinal.authJwt).resolves.toEqual('authJwt');
  });

  it('should result in error if consumer authentication has failed', () => {
    cardinal.onValidated(
      {
        ErrorNumber: 1
      },
      'error'
    );

    return expect(cardinal.authJwt).rejects.toEqual(1);
  });
});
