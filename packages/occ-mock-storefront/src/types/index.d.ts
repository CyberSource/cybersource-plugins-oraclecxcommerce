/// <reference types="knockout" />

declare module 'ccConstants' {
  enum ccConstants {
    ENDPOINT_ORDERS_CREATE_ORDER = '/order',
    PAYMENT_GROUP_STATE_INITIAL = 'Initial',
    PAYMENT_GROUP_STATE_AUTHORIZED = 'Authorised',
    ORDER_OP_INITIATE = 'orderInitiate'
  }

  export default ccConstants;
}

declare module 'notifier' {
  export function sendError(id: string, text: string, scrollToMessage?: boolean): void;

  export function clearError(id: string): void;
}

declare module 'ccLogger' {
  export const alertMessages: KnockoutObservableArray<string[]>;

  interface Logger {
    info(message: string, pObject?: any): void;
    debug(message: string, pObject?: any): void;
    warn(message: string, pObject?: any): void;
    error(message: string, pObject?: any): void;
  }

  const logger: Logger;
  export default logger;
}

declare module 'ccRestClient' {
  type SuccessCallback = (json: any) => void;
  type ErrorCallback = (error: Error) => void;

  export function request(
    url: string,
    payload: any,
    success: SuccessCallback,
    fail: ErrorCallback,
    param?: string
  ): void;

  export const loggedIn = true;
}

declare module 'pubsub' {
  export enum topicNames {
    ORDER_COMPLETED = 'orderCompleted',
    ORDER_SUBMISSION_SUCCESS = 'orderSubmissionSuccess',
    ORDER_SUBMISSION_FAIL = 'orderSubmissionFail',
    ORDER_CREATE = 'orderCreate',
    ORDER_CREATED_INITIAL = 'orderCreatedInitial',
    ORDER_CREATED = 'orderCreated',
    PAGE_CHANGED = 'pageChanged',
    USER_LOGIN_SUCCESSFUL = 'user.login.successful',
    USER_LOGOUT_SUCCESSFUL = 'user.logout.successful'
  }
}

// $.Topic interface
interface PubSub {
  subscribe: (...args: any[]) => void;
  publish: (...payload: any[]) => void;
}

// extend global jQuery instance with 'Topic' API
interface JQueryStatic {
  Topic(eventName: string): PubSub;
}

declare namespace OCC {
  export interface CartItem {
    productId: string;
    quantity: number;
  }
  export interface Cart {
    currencyCode: KnockoutObservable<string>;
    amount: KnockoutObservable<string>;
    total: KnockoutObservable<number>;
    subTotal: KnockoutObservable<number>;
    tax: KnockoutObservable<number>;
    shipping: KnockoutObservable<number>;
    orderDiscount: KnockoutObservable<number>;
    currentOrderId: KnockoutObservable<string>;
    nonTransientCartCheck: KnockoutObservable<boolean>;

    items: KnockoutObservableArray<CartItem>;
  }

  export interface User {
    id: KnockoutObservable<string>;
    orderId: KnockoutObservable<string>;
    loggedIn: () => boolean;
  }

  export interface Site {
    extensionSiteSettings: {
      'isv-occ-gateway': {
        paymentMethodTypes: Array<string>;
      };
    };
  }

  export interface Address {
    city: KnockoutObservable<string>;
    selectedCountry: KnockoutObservable<string>;
    country: KnockoutObservable<string>;
    firstName: KnockoutObservable<string>;
    lastName: KnockoutObservable<string>;
    postalCode: KnockoutObservable<string>;
    selectedState: KnockoutObservable<string>;
    address1: KnockoutObservable<string>;

    isValid: () => boolean;
  }

  export interface OrderData {
    billingAddress?: OrderDataBillingAddress;
    shippingAddress?: OrderDataShippingAddress;
    id?: string;
    orderProfileId?: string;
    shippingMethod?: string;
    shoppingCart: ShoppingCart;
  }

  export interface OrderDataBillingAddress {
    city: string;
  }

  export interface OrderDataShippingAddress {
    city: string;
  }

  export interface ShoppingCart {
    items: ShoppingCartItem[];
    coupons?: string[];
    orderTotal: number;
  }

  export interface ShoppingCartItem {
    productId: string;
    quantity: number;
    catRefId?: string;
    giftWithPurchaseCommerceItemMarkers?: [];
    externalData?: [];
    commerceItemId?: string;
  }

  export interface SupportedCardData {
    img: string;
    code: string;
    name: string;
    length: string;
    startDateRequired: boolean;
    value: string;
    cvvLength: number;
    iin: string;
  }

  export interface PaymentContextData {
    cards: SupportedCardData[];
    IINPromotionsEnabled: boolean;
    isCVVRequiredForSavedCards: boolean;
    enabledTypes: string[];
    isCardGatewayGeneric: boolean;
  }

  export interface PageContextData {
    payment: PaymentContextData;
  }

  export interface OccContextData {
    page: PageContextData;
  }

  export type ValidationCallback = () => void;

  export interface Order {
    id: KnockoutObservable<string>;
    op: KnockoutObservable<string>;
    shippingAddress: KnockoutObservable<Address>;
    billingAddress: KnockoutObservable<Address>;
    order: KnockoutObservable<OrderData>;
    cart: KnockoutObservable<Cart>;
    payments: KnockoutObservableArray<any>;
    paymentGateway: KnockoutObservable<any>;
    checkoutLink: string;
    enableOrderButton: KnockoutObservable<boolean>;
    errorFlag: boolean;
    contextData: OccContextData;
    validationCallbacks: KnockoutObservableArray<ValidationCallback>;

    addValidationCallback: (callback: OCC.ValidationCallback) => void;
    triggerValidationCallbacks: () => void;
    handlePlaceOrder: () => void;
    createOrder: () => void;
    postOrderCreateOrUpdateSuccess: (data: any) => void;
    postOrderCreateOrUpdateFailure: (data: any) => void;
    updatePayments: (payments: any[]) => void;
    addValidationError: (messageId: string, message: string) => void;
  }

  export interface WidgetViewModel {
    id: KnockoutObservable<string>;
    isPreview: KnockoutObservable<boolean>;
    site: KnockoutObservable<Site>;
    cart: KnockoutObservable<Cart>;
    order: KnockoutObservable<Order>;
    user: KnockoutObservable<User>;
    locale: KnockoutObservable<string>;
    storedPaymentType: KnockoutObservable<string>;

    addTranslations: (resource: any) => void;
    translate: (x: string, params?: any) => string;
    setCurrencyCode: (currencyCode: string) => void;
    setLocale(locale: string): void;
  }

  export interface SavedCard {
    savedCardId: string;
    hasExpired: boolean;
    isDefault: boolean;
    nameOnCard: string;
    repositoryId: string;
    expiryMonth: string;
    cardType: string;
    nickname: string;
    expiryYear: '2025';
    cardNumber: string;
    iin: string;
  }

  export type SavedCardList = SavedCard[];
}
