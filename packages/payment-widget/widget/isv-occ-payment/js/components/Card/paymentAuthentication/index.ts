import loadScript from '@payment-widget/components/utils/scriptLoader';
import { PaymentAuthActions, PaymentAuthConfig, ValidationOptions } from '../common';
import CardinalCommerce from './cardinalCommerce';

const emptyFn = () => ({});
const emptyPromise = async () => ({});

function setupPaymentAuthentication(authConfig: PaymentAuthConfig): PaymentAuthActions {
  if (!authConfig.payerAuthEnabled) {
    // NULL object
    return {
      updateBin: emptyFn,
      getReferenceId: emptyPromise,
      getAuthJwt: emptyPromise
    };
  }

  const cardinal = new CardinalCommerce();
  loadScript(authConfig.songbirdUrl).then(() => cardinal.setup());

  return {
    updateBin: (bin: string) => cardinal.updateBin(bin),
    getReferenceId: async () => {
      await cardinal.initiate();

      return {
        referenceId: await cardinal.referenceId
      };
    },
    getAuthJwt: async (options: ValidationOptions) => ({
      authJwt: await cardinal.validatePayment(options)
    })
  };
}

export default setupPaymentAuthentication;
