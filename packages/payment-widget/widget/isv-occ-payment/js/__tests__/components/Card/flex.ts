export class FlexFormFieldMock implements FlexFormField {
  load = jest.fn();
  on = jest.fn();
}

export class FlexFormMock implements FlexForm {
  fields: Record<string, FlexFormFieldMock> = {};

  createField(type: string, _options?: FlexFormFieldOptions) {
    const field = new FlexFormFieldMock();

    this.fields[type] = field;

    return field;
  }

  createToken = jest.fn();
}

export class FlexMock {
  captureContext: string;

  constructor(captureContext: string) {
    this.captureContext = captureContext;
  }

  microform(_options?: FlexFormOptions) {
    return new FlexFormMock();
  }
}
