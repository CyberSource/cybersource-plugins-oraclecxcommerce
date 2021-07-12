import { amdJsLoad } from '@payment-widget/components/utils/scriptLoader';
import occClient from '@payment-widget/services/occClient';
import { CaptureContextProperties } from '@payment-widget/store/common';
import jwt_decode from 'jwt-decode';
import ko from 'knockout';
import { CardModel, CardPaymentController, CreditCardFormModelDetails } from '../common';
import Microform from './flexMicroForm';
import formTemplate from './index.html';
import { getEndYears } from './utils';
import { Validator } from './validator';

interface TransientToken {
  encoded: string;
  decoded: FlexTokenData;
}

interface CreditCardFormParams {
  flexSdkUrl: string;
  paymentController: CardPaymentController;
  supportedCardTypes: OCC.SupportedCardData[];
  isUserLoggedIn: boolean;
}

function getCaptureContext() {
  return occClient.getCaptureContext().then(
    (context) =>
      <CaptureContextProperties>{
        captureContext: context.captureContext,
        captureContextCipherEncrypted: context.cipher.encrypted,
        captureContextCipherIv: context.cipher.iv
      }
  );
}

function CreditCardFormViewModel(params: CreditCardFormParams) {
  const { flexSdkUrl, paymentController, supportedCardTypes, isUserLoggedIn } = params;
  let captureContextData: CaptureContextProperties;
  const cardTypeList = ko.observableArray<OCC.SupportedCardData>(supportedCardTypes);
  const expirationMonth = ko.observable('');
  const expirationYear = ko.observable('');
  const nameOnCard = ko.observable('');
  const selectedCardType = ko.observable('');
  const selectedCardCode = ko.observable('');
  const cardNumber = ko.observable(false);
  const securityCode = ko.observable(false);
  const saveCard = ko.observable(false);
  const setAsDefault = ko.observable(false);
  const validationTriggered = ko.observable(false);

  saveCard.subscribe((value) => !value && setAsDefault(false));

  const { microform, validator } = (function initializeMicroform(flexSdkUrl: string) {
    const microform = new Microform({
      sdkUrl: flexSdkUrl,
      securityCodeContainer: '#flexSecurityCode-container',
      cardNumberContainer: '#flexCardNumber-container'
    });

    const validator = new Validator({
      expirationMonth,
      expirationYear,
      nameOnCard,
      selectedCardType,
      cardNumber,
      securityCode,
      microform,
      validationTriggered
    });

    amdJsLoad(flexSdkUrl, 'Flex')
      .then(getCaptureContext)
      .then((context) => {
        captureContextData = context;
        return microform.setup(context.captureContext);
      });

    return {
      microform,
      validator
    };
  })(flexSdkUrl);

  microform.cardType.subscribe((type) => selectedCardType(getSelectedCard(type) ? type : ''));
  selectedCardType.subscribe((type) => selectedCardCode(getSelectedCard(type)?.code ?? ''));
  function getSelectedCard(type: string) {
    return cardTypeList().find((data) => data.value == type);
  }

  const cardModel: CardModel = (function () {
    let transientTokenJwt: TransientToken | undefined;
    let maskedCardNumber: string;

    async function getTransientToken() {
      return <TransientToken>(transientTokenJwt ||
        (await microform
          .createToken({
            type: selectedCardCode(),
            expirationMonth: expirationMonth(),
            expirationYear: expirationYear()
          })
          .then((jwt) => ({
            encoded: jwt,
            decoded: jwt_decode(jwt)
          }))));
    }

    return {
      validate: () => {
        validationTriggered(true);
        return validator.isValid();
      },
      async getCardData(): Promise<CreditCardFormModelDetails> {
        transientTokenJwt = await getTransientToken();
        maskedCardNumber = transientTokenJwt.decoded.data.number.toLowerCase();
        return {
          cardType: selectedCardType(),
          nameOnCard: nameOnCard(),
          cardNumber: maskedCardNumber,
          expiryMonth: transientTokenJwt.decoded.data.expirationMonth,
          expiryYear: transientTokenJwt.decoded.data.expirationYear,
          ...(saveCard() && {
            saveCard: true
          }),
          ...(setAsDefault() && {
            setAsDefault: true
          }),
          customProperties: {
            transientTokenJwt: transientTokenJwt.encoded,
            ...captureContextData
          }
        };
      },
      getBin() {
        return maskedCardNumber.substring(0, 6);
      },
      reset: () => {
        transientTokenJwt = undefined;
      }
    };
  })();

  paymentController.selectModel(cardModel);

  return {
    nameOnCard,
    selectedCardType,
    cardNumber,
    securityCode,
    expirationMonth,
    expirationYear,
    saveCard,
    setAsDefault,
    endYearList: getEndYears(),
    cardTypeList,
    isUserLoggedIn,
    validator
  };
}

export default {
  viewModel: {
    createViewModel: CreditCardFormViewModel
  },
  template: formTemplate
};
