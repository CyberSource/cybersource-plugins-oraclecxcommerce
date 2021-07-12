declare interface FlexFormOptions {
  styles?: any;
}

declare interface FlexFormFieldOptions {
  placeholder: string;
}

declare interface CardOptions {
  type: string;
  expirationMonth: string;
  expirationYear: string;
}

declare interface FlexFormField {
  load(container: string): void;
  on(eventName: string, callback: (data: any) => void): void;
}

declare interface FlexForm {
  createField(type: string, options?: FlexFormFieldOptions): FlexFormField;

  createToken(
    options: CardOptions,
    callback: (err: any, response: string) => void
  ): Promise<string>;
}

declare interface FlexTokenData {
  data: {
    expirationYear: string;
    number: string;
    expirationMonth: string;
    type: string;
  };
}

declare interface FlexTokenDto {
  data: FlexTokenData;
}

declare class Flex {
  constructor(captureContext: string);

  greeting: string;
  microform(options?: FlexFormOptions): FlexForm;
}

declare interface CardinalSetupOptions {
  jwt: string;
}

type SetupCallback = (data: any) => void;
type ValidateCallback = (data: any, authJwt: string) => void;

declare interface CardinalAPI {
  trigger(op: 'bin.process', newBin: string): void;
  on(
    event: 'payments.setupComplete' | 'payments.validated',
    callback: SetupCallback | ValidateCallback
  ): void;
  setup(op: 'init', options: CardinalSetupOptions): void;
  configure(config: any): void;
  continue(op: 'cca', cardIssuerData: any, validationData: any): void;
}

declare const Cardinal: CardinalAPI;
