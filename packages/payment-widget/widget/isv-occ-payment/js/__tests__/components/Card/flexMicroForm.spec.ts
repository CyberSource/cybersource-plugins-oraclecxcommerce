import Microform from '@payment-widget/components/Card/CreditCardForm/flexMicroForm';
import { FlexFormFieldMock, FlexFormMock, FlexMock } from './flex';

(<any>global).Flex = FlexMock;

const OPTIONS = {
  sdkUrl: 'string',
  securityCodeContainer: 'securityCodeContainer',
  cardNumberContainer: 'cardNumberContainer'
};

const CARD_OPTIONS = { type: 'visa', expirationMonth: '02', expirationYear: '2020' };

describe('Payment Component - Card:Microform', () => {
  let microform!: Microform;
  let flexForm!: FlexFormMock;
  let numberField!: FlexFormFieldMock;
  let securityCodeField!: FlexFormFieldMock;

  beforeEach(() => {
    microform = new Microform(OPTIONS);

    microform.setup('captureContext');

    flexForm = <FlexFormMock>microform.microform;
    numberField = flexForm.fields['number'];
    securityCodeField = flexForm.fields['securityCode'];
  });

  it('should setup microform', () => {
    expect(flexForm).not.toBeNull();

    expect(numberField).not.toBeNull();
    expect(numberField.load).toHaveBeenCalledWith(OPTIONS.cardNumberContainer);
    expect(numberField.on).toHaveBeenCalledWith('change', expect.any(Function));

    expect(securityCodeField).not.toBeNull();
    expect(securityCodeField.load).toHaveBeenCalledWith(OPTIONS.securityCodeContainer);
    expect(securityCodeField.on).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('should create token', async () => {
    flexForm.createToken.mockImplementationOnce((_options, cb) => cb(null, 'token'));

    const token = await microform.createToken(CARD_OPTIONS);
    expect(token).toEqual('token');
  });

  it('should result in error if token could not be created', () => {
    const error = {
      message: 'error'
    };

    flexForm.createToken.mockImplementationOnce((_options, cb) => cb(error, null));

    return expect(microform.createToken(CARD_OPTIONS)).rejects.toEqual('error');
  });

  it('should handle security code change and its validity', () => {
    microform.handleSecurityCodeChange({ valid: true });
    expect(microform.securityCodeIsValid()).toBeTruthy();

    microform.handleSecurityCodeChange({ valid: false });
    expect(microform.securityCodeIsValid()).toBeFalsy();
  });

  describe('Handle card number change', () => {
    const changedCard = {
      valid: true
    };

    const data = {
      card: [changedCard]
    };

    it('card is valid', () => {
      microform.handleCardNumberChange(data);
      expect(microform.cardNumberIsValid()).toBeTruthy();
    });

    it('card is not valid', () => {
      changedCard.valid = false;
      microform.handleCardNumberChange(data);
      expect(microform.cardNumberIsValid()).toBeFalsy();

      microform.handleCardNumberChange({});
      expect(microform.cardNumberIsValid()).toBeFalsy();
    });
  });
});
