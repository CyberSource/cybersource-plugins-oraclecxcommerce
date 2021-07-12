import paymentStore from '@payment-widget/store/paymentStore';
import '@testing-library/jest-dom';
import { mockDeep } from 'jest-mock-extended';

const occWidget = mockDeep<OCC.WidgetViewModel>();
(<any>occWidget).translate = jest.fn();

paymentStore.init(occWidget);
