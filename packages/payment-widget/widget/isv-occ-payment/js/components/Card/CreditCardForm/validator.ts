import paymentStore from '@payment-widget/store/paymentStore';
import ko from 'knockout';
import Microform from './flexMicroForm';

const isDateGreaterThanCurrent = (month: string, year: string) => {
  const currentDate = new Date();
  const currentYearMonth = new Date(currentDate.getFullYear(), currentDate.getMonth());

  return year ? new Date(+year, +month - 1) >= currentYearMonth : month;
};

interface ValidatedFields {
  expirationMonth: KnockoutObservable<string>;
  expirationYear: KnockoutObservable<string>;
  nameOnCard: KnockoutObservable<string>;
  selectedCardType: KnockoutObservable<string>;
  cardNumber: KnockoutObservable<boolean>;
  securityCode: KnockoutObservable<boolean>;
  microform: Microform;
  validationTriggered: KnockoutObservable<boolean>;
}

export class Validator {
  validationRules: any;

  isValid: KnockoutObservable<boolean>;

  validationOptions = {
    insertMessages: true,
    messagesOnModified: false,
    errorMessageClass: 'text-danger'
  };

  constructor(component: ValidatedFields) {
    const {
      expirationMonth,
      expirationYear,
      nameOnCard,
      selectedCardType,
      cardNumber,
      securityCode,
      microform,
      validationTriggered
    } = component;

    const rule = (message: string, config: any = {}) => ({
      ...config,
      onlyIf: validationTriggered,
      message: paymentStore.widget.translate(message)
    });

    this.isValid = ko.validatedObservable({
      expirationMonth: expirationMonth.extend({
        validation: rule('expirationMonthError', {
          validator: isDateGreaterThanCurrent,
          params: expirationYear
        }),
        required: rule('expirationMonthError')
      }),
      expirationYear: expirationYear.extend({
        required: rule('expirationYearError')
      }),
      cardHolderName: nameOnCard.extend({
        required: rule('nameOnCardError'),
        pattern: rule('nameOnCardError', {
          params: /^((?:[A-Za-z]+ ?){1,3})$/
        })
      }),
      selectedCardType: selectedCardType.extend({
        required: rule('selectedCardTypeError')
      }),
      cardNumber: cardNumber.extend({
        validation: rule('cardNumberError', {
          validator: () => microform.cardNumberIsValid()
        })
      }),
      securityCode: securityCode.extend({
        validation: rule('cardCvvError', {
          validator: () => microform.securityCodeIsValid()
        })
      })
    }).isValid;
  }
}
