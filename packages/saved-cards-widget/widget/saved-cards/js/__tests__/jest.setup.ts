import store from '@saved-cards-widget/store';
import { mockDeep } from 'jest-mock-extended';
import 'knockout.validation';

const translateStub = (key: string, _params?: any) => key;

const occWidget = mockDeep<OCC.WidgetViewModel>();
(<any>occWidget).translate = translateStub;

store.init(occWidget);
