import ko from 'knockout';
import defaultCart from './viewModels/cart';
import defaultOrder from './viewModels/order';

const TRANSLATIONS = <any[]>[];

const addTranslations = (translations: any) => {
  TRANSLATIONS.push(translations.resources);
};

const getLocalized = (key: string) => {
  return TRANSLATIONS.find((resource) => Boolean(resource[key]))[key];
};

const translate = (x: string, params?: any) => {
  let translated = getLocalized(x) || `[t]${x}`;

  if (params) {
    translated = translated.replace(
      /__(\w+)__/g,
      (placeHolder: string, param: string) => params[param] || placeHolder
    );
  }

  return translated;
};

const defaultSite = ko.observable({
  extensionSiteSettings: {
    'isv-occ-gateway': {
      paymentMethodTypes: ['card', 'generic']
    }
  }
});

const defaultUser = ko.observable({
  id: ko.observable('1234'),
  orderId: ko.observable('o30039'),

  loggedIn: ko.observable(true)
});

const widget: OCC.WidgetViewModel = {
  id: ko.observable('random_mocked_id'),
  order: defaultOrder,
  site: defaultSite,
  cart: defaultCart,
  user: defaultUser,
  isPreview: ko.observable(false),
  locale: ko.observable('en_US'),
  storedPaymentType: ko.observable(''),

  addTranslations,

  translate,

  setCurrencyCode(currencyCode: string) {
    this.cart().currencyCode(currencyCode);
  },

  setLocale(locale: string) {
    this.locale(locale);
  }
};

export default widget;
