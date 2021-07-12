import { CardPaymentDetails, PayerAuthProperties } from '@payment-widget/store/common';
import paymentActions, {
  ACTION_TYPE,
  PaymentAction,
  paymentActionFilter
} from '@payment-widget/store/paymentActions';
import paymentStore from '@payment-widget/store/paymentStore';
import { CardModel, PaymentAuthActions } from './common';

const actionFilter = (action: ACTION_TYPE) => paymentActionFilter('card', action);

export default function CardPaymentController(paymentAuthentication: PaymentAuthActions) {
  let cardModel: CardModel;

  function selectModel(model: CardModel) {
    cardModel = model;
  }

  paymentActions.takePaymentAction(actionFilter('validate'), validatePayment);
  paymentActions.takePaymentAction(actionFilter('initiate'), initiatePayment);
  paymentActions.takePaymentAction(
    actionFilter('validateConsumerAuthentication'),
    validateConsumerAuthentication
  );
  paymentActions.takePaymentAction(actionFilter('finalize'), finalizePayment);

  function validatePayment(_action: PaymentAction) {
    if (!cardModel.validate()) {
      paymentActions.submitValidationResult({
        valid: false,
        message: paymentStore.widget.translate('paymentDetailsError')
      });
    }
  }

  async function initiatePayment(_action: PaymentAction) {
    const authReferenceIdRecord = await paymentAuthentication.getReferenceId();
    const paymentDetails = await buildPaymentDetails(cardModel, authReferenceIdRecord);
    paymentAuthentication.updateBin(cardModel.getBin());
    paymentActions.submitPaymentDetails(paymentDetails);
  }

  async function validateConsumerAuthentication(action: PaymentAction) {
    const authJwtRecord = await paymentAuthentication.getAuthJwt(action.payload);
    const paymentDetails = await buildPaymentDetails(cardModel, authJwtRecord);
    paymentActions.submitPaymentDetails(paymentDetails);
  }

  function finalizePayment() {
    cardModel.reset();
  }

  return {
    selectModel
  };
}

// TODO Fix custom properties typings
async function buildPaymentDetails(
  cardModel: CardModel,
  authCustomProperties: PayerAuthProperties
): Promise<CardPaymentDetails> {
  const { customProperties, ...details } = await cardModel.getCardData();
  return {
    type: 'card',
    ...details,
    customProperties: <any>{
      ...customProperties,
      ...authCustomProperties
    }
  };
}
