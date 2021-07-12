import paymentStore from '@payment-widget/store/paymentStore';
import ko from 'knockout';

interface MicroformOptions {
  sdkUrl: string;
  securityCodeContainer: string;
  cardNumberContainer: string;
}

export default class Microform {
  options: MicroformOptions;
  microform!: FlexForm;

  cardNumberIsValid: KnockoutObservable<boolean>;
  securityCodeIsValid: KnockoutObservable<boolean>;
  cardType: KnockoutObservable<string>;

  constructor(options: MicroformOptions) {
    this.options = options;

    this.cardNumberIsValid = ko.observable(false);
    this.securityCodeIsValid = ko.observable(false);
    this.cardType = ko.observable('');
  }

  handleCardNumberChange(data: any): void {
    const cardData = data.card?.[0];

    this.cardType(cardData?.name ?? '');
    this.cardNumberIsValid(Boolean(cardData?.valid));
  }

  handleSecurityCodeChange(data: any): void {
    this.securityCodeIsValid(Boolean(data.valid));
  }

  setup(captureContext: string) {
    this.microform = new Flex(captureContext).microform();

    const number = this.microform.createField('number', {
      placeholder: paymentStore.widget.translate('cardNumberPlaceholder')
    });
    const securityCode = this.microform.createField('securityCode', {
      placeholder: paymentStore.widget.translate('securityCodePlaceholder')
    });

    number.load(this.options.cardNumberContainer);
    number.on('change', this.handleCardNumberChange.bind(this));

    securityCode.load(this.options.securityCodeContainer);
    securityCode.on('change', this.handleSecurityCodeChange.bind(this));
  }

  createToken(cardOptions: CardOptions): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.microform.createToken(cardOptions, (err, response) =>
        err ? reject(err.message) : resolve(response)
      );
    });
  }
}
