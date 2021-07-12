define(["knockout","ccLogger","jquery","pubsub","ccRestClient"], function(__WEBPACK_EXTERNAL_MODULE__0__, __WEBPACK_EXTERNAL_MODULE__1__, __WEBPACK_EXTERNAL_MODULE__2__, __WEBPACK_EXTERNAL_MODULE__4__, __WEBPACK_EXTERNAL_MODULE__5__) { return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 12);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE__0__;

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE__1__;

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE__2__;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var base64_url_decode = __webpack_require__(10);

function InvalidTokenError(message) {
  this.message = message;
}

InvalidTokenError.prototype = new Error();
InvalidTokenError.prototype.name = 'InvalidTokenError';

module.exports = function (token,options) {
  if (typeof token !== 'string') {
    throw new InvalidTokenError('Invalid token specified');
  }

  options = options || {};
  var pos = options.header === true ? 0 : 1;
  try {
    return JSON.parse(base64_url_decode(token.split('.')[pos]));
  } catch (e) {
    throw new InvalidTokenError('Invalid token specified: ' + e.message);
  }
};

module.exports.InvalidTokenError = InvalidTokenError;


/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE__4__;

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE__5__;

/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = "<div class=\"payment-method-applepay\">\n  <div class=\"apple-pay-button-with-text apple-pay-button-black-with-text\"\n    data-bind=\"click: triggerPayment, visible: supported\">\n  </div>\n\n  <div data-bind=\"visible: !supported(), widgetLocaleText: 'applePayNotSupported'\"></div>\n</div>";

/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = "<fieldset id=\"paymentDetails\">\n  <div class=\"row\">\n    <!-- Name on the Card -->\n    <div class=\"form-group col-sm-4\">\n      <label\n        class=\"control-label\"\n        id=\"CC-splitPayments-nameOnCard-label\"\n        for=\"CC-splitPayments-nameOnCard\"\n        data-bind=\"widgetLocaleText: 'nameOnCardLabel'\"\n        >Name on Card</label\n      >\n      <div class=\"control\">\n        <input\n          aria-required=\"true\"\n          type=\"text\"\n          class=\"col-md-12 form-control\"\n          id=\"CC-splitPayments-nameOnCard\"\n          name=\"nameOnCard\"\n          data-bind=\"value: nameOnCard\"\n          placeholder=\"Name on Card\"\n          required=\"required\"\n        />\n      </div>\n    </div>\n\n    <!-- cardType -->\n    <div class=\"form-group col-sm-3\">\n      <label\n        class=\"control-label\"\n        id=\"CC-splitPayments-cardType-label\"\n        for=\"CC-splitPayments-cardType\"\n        data-bind=\"widgetLocaleText: 'cardTypeLabel'\"\n        >Card Type</label\n      >\n      <div class=\"control\">\n        <select\n          aria-required=\"true\"\n          type=\"text\"\n          class=\"col-md-12 form-control\"\n          id=\"CC-splitPayments-cardType\"\n          name=\"cardType\"\n          data-bind=\"value: selectedCardType\"\n          ><option value=\"\">Card Type</option>\n          <!-- ko foreach: cardTypeList -->\n          <option data-bind=\"text: name, value: value\"></option>\n          <!-- /ko -->\n        </select>\n      </div>\n    </div>\n  </div>\n\n  <!-- card number & cvv -->\n  <div class=\"row\">\n    <div class=\"form-group col-sm-4\">\n      <label\n        class=\"control-label\"\n        id=\"CC-splitPayments-cardNumber-label\"\n        for=\"flexCardNumber-container\"\n        data-bind=\"widgetLocaleText: 'cardNumberLabel'\"\n        >Card Number</label\n      >\n      <!-- card number -->\n      <div class=\"control\">\n        <div id=\"flexCardNumber-container\" class=\"form-control\"></div>\n      </div>\n    </div>\n\n    <div class=\"form-group col-sm-4\">\n      <label\n        class=\"control-label\"\n        id=\"CC-splitPayments-cardCVV-label\"\n        for=\"flexSecurityCode-container\"\n        data-bind=\"widgetLocaleText: 'cardCVVLabel'\"\n        >CVV</label\n      >\n      <!-- cvv -->\n      <div class=\"control row\">\n        <div class=\"col-sm-6\">\n          <div id=\"flexSecurityCode-container\" class=\"form-control\"></div>\n        </div>\n      </div>\n    </div>\n  </div>\n\n  <!-- end month and year -->\n  <div class=\"row\">\n    <div class=\"form-group col-sm-4\">\n      <label\n        class=\"control-label\"\n        id=\"CC-splitPayments-endMonth-label\"\n        for=\"CC-splitPayments-endMonth\"\n        data-bind=\"widgetLocaleText: 'endMonthLabel'\"\n        >Expires (Month)</label\n      >\n      <!-- endMonth -->\n      <div class=\"control\">\n        <select\n          aria-required=\"true\"\n          type=\"text\"\n          class=\"form-control\"\n          id=\"CC-splitPayments-endMonth\"\n          data-bind=\"value: expirationMonth\"\n          name=\"endMonth\"\n          ><option data-bind=\"widgetLocaleText: 'endMonthLabel'\" value=\"\">Expires (Month)</option\n          ><option value=\"01\">01 - <span data-bind=\"widgetLocaleText: 'januaryText'\">January</span></option\n          ><option value=\"02\">02 - <span data-bind=\"widgetLocaleText: 'februaryText'\">February</span></option\n          ><option value=\"03\">03 - <span data-bind=\"widgetLocaleText: 'marchText'\">March</span></option\n          ><option value=\"04\">04 - <span data-bind=\"widgetLocaleText: 'aprilText'\">April</span></option\n          ><option value=\"05\">05 - <span data-bind=\"widgetLocaleText: 'mayText'\">May</span></option\n          ><option value=\"06\">06 - <span data-bind=\"widgetLocaleText: 'juneText'\">June</span></option\n          ><option value=\"07\">07 - <span data-bind=\"widgetLocaleText: 'julyText'\">July</span></option\n          ><option value=\"08\">08 - <span data-bind=\"widgetLocaleText: 'augustText'\">August</span></option\n          ><option value=\"09\">09 - <span data-bind=\"widgetLocaleText: 'septemberText'\">September</span></option\n          ><option value=\"10\">10 - <span data-bind=\"widgetLocaleText: 'octoberText'\">October</span></option\n          ><option value=\"11\">11 - <span data-bind=\"widgetLocaleText: 'novemberText'\">November</span></option\n          ><option value=\"12\">12 - <span data-bind=\"widgetLocaleText: 'decemberText'\">December</span></option>\n          <!-- endMonth -->\n        </select>\n      </div>\n    </div>\n    <div class=\"form-group col-sm-4\">\n      <label\n        class=\"control-label\"\n        id=\"CC-splitPayments-endYear-label\"\n        for=\"CC-splitPayments-endYear\"\n        data-bind=\"widgetLocaleText: 'endYearLabel'\"\n        >Expires (Year)</label\n      >\n      <!-- endYear -->\n      <div class=\"control\">\n        <select\n          aria-required=\"true\"\n          type=\"text\"\n          class=\"form-control\"\n          id=\"CC-splitPayments-endYear\"\n          data-bind=\"value: expirationYear\"\n          name=\"endYear\"\n          ><option data-bind=\"widgetLocaleText: 'endYearLabel'\" value=\"\">Expires (Year)</option>\n          <!-- ko foreach: endYearList -->\n          <option data-bind=\"text: name, value: value\"></option>\n          <!-- /ko -->\n          <!-- endYear -->\n        </select>\n      </div>\n    </div>\n\n  </div>\n\n  <div class=\"row\">\n    <div class=\"form-group col-sm-12\">\n      <div class=\"checkbox\">\n        <label><input type=\"checkbox\"\n          data-bind=\"checked: saveCard\"\n          value=\"\">\n          <span data-bind=\"widgetLocaleText: 'saveCardLabel'\">Save this card</span>\n        </label>\n      </div>\n      <div class=\"checkbox\">\n        <label>\n          <input type=\"checkbox\"\n            data-bind=\"checked: setAsDefault, widgetLocaleText: 'setAsDefaultLabel'\"\n            value=\"\">\n          <span data-bind=\"widgetLocaleText: 'setAsDefaultLabel'\">Set this card as default card</span>\n        </label>\n      </div>\n    </div>\n  </div>\n</fieldset>\n\n<div class=\"paymentDetails__saved-cards\">\n  <!-- ko if: creditCardList().length > 0 -->\n    <h5>[TODO IMPLEMENT] Your saved cards</h5>\n    <ul>\n    <!-- ko foreach: creditCardList -->\n      <li data-bind=\"text: savedCardId\"></li>\n     <!-- /ko -->\n    </ul>\n\n    <a href =\"#\">Add new card</a>\n   <!-- /ko -->\n</div>\n";

/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = "<div class=\"payment-method-googlepay\">\n  <div id=\"googlePayButtonContainer\" data-bind=\"visible: supported\"></div>\n\n  <div data-bind=\"visible: !supported(), widgetLocaleText: 'googlePayNotSupported'\"></div>\n</div>";

/***/ }),
/* 9 */
/***/ (function(module, exports) {

module.exports = "<div class=\"payment-widget-selector\">\n  <!-- ko if: paymentMethods().length > 0 -->\n  <h4 data-bind=\"widgetLocaleText: 'paymentSelectorHeader'\">Choose Payment Method</h4>\n\n  <div id=\"payment-selector__wrapper\">\n    <div\n      class=\"panel-group\"\n      id=\"payment-selector__accordion\"\n      role=\"tablist\"\n      aria-multiselectable=\"true\"\n    >\n      <!-- ko foreach: paymentMethods -->\n      <div class=\"panel panel-default\">\n        <div class=\"panel-heading\" role=\"tab\" id=\"headingOne\">\n          <h4 class=\"panel-title\">\n            <a\n              role=\"button\"\n              data-toggle=\"collapse\"\n              data-parent=\"#payment-selector__accordion\"\n              aria-expanded=\"true\"\n              aria-controls=\"collapseOne\"\n              data-bind=\"attr: {'href': '#payment-method-' + $data.type},click: $parent.selectMethod.bind($parent)\"\n            >\n              <span data-bind=\"widgetLocaleText: 'paymentMethod_' + $data.type\">\n              </span>\n            </a>\n          </h4>\n        </div>\n        <div\n          role=\"tabpanel\"\n          aria-labelledby=\"headingOne\"\n          data-bind=\"attr: {id: 'payment-method-' + $data.type},\n            css: {'panel-collapse collapse in': $parent.isSelected($data), 'panel-collapse collapse': !$parent.isSelected($data) }\"\n        >\n          <div class=\"panel-body\">\n            <!-- Display payment type specific component -->\n            <div\n              data-bind='component: {\n              name: \"payment-method-\" + $data.type,\n              params: { config: $data.config }\n            }'\n            ></div>\n          </div>\n        </div>\n      </div>\n      <!-- /ko -->\n    </div>\n  </div>\n  <!-- /ko -->\n</div>\n";

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

var atob = __webpack_require__(11);

function b64DecodeUnicode(str) {
  return decodeURIComponent(atob(str).replace(/(.)/g, function (m, p) {
    var code = p.charCodeAt(0).toString(16).toUpperCase();
    if (code.length < 2) {
      code = '0' + code;
    }
    return '%' + code;
  }));
}

module.exports = function(str) {
  var output = str.replace(/-/g, "+").replace(/_/g, "/");
  switch (output.length % 4) {
    case 0:
      break;
    case 2:
      output += "==";
      break;
    case 3:
      output += "=";
      break;
    default:
      throw "Illegal base64url string!";
  }

  try{
    return b64DecodeUnicode(output);
  } catch (err) {
    return atob(output);
  }
};


/***/ }),
/* 11 */
/***/ (function(module, exports) {

/**
 * The code was extracted from:
 * https://github.com/davidchambers/Base64.js
 */

var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

function InvalidCharacterError(message) {
  this.message = message;
}

InvalidCharacterError.prototype = new Error();
InvalidCharacterError.prototype.name = 'InvalidCharacterError';

function polyfill (input) {
  var str = String(input).replace(/=+$/, '');
  if (str.length % 4 == 1) {
    throw new InvalidCharacterError("'atob' failed: The string to be decoded is not correctly encoded.");
  }
  for (
    // initialize result and counters
    var bc = 0, bs, buffer, idx = 0, output = '';
    // get next character
    buffer = str.charAt(idx++);
    // character found in table? initialize bit storage and add its ascii value;
    ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
      // and if not first of each 4 characters,
      // convert the first 8 bits to one ascii character
      bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
  ) {
    // try to find character in table (0-63, not found => -1)
    buffer = chars.indexOf(buffer);
  }
  return output;
}


module.exports = typeof window !== 'undefined' && window.atob && window.atob.bind(window) || polyfill;


/***/ }),
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXTERNAL MODULE: external {"amd":"knockout","commonjs":"knockout","commonjs2":"knockout"}
var external_amd_knockout_commonjs_knockout_commonjs2_knockout_ = __webpack_require__(0);
var external_amd_knockout_commonjs_knockout_commonjs2_knockout_default = /*#__PURE__*/__webpack_require__.n(external_amd_knockout_commonjs_knockout_commonjs2_knockout_);

// EXTERNAL MODULE: external {"amd":"ccRestClient","commonjs":"ccRestClient","commonjs2":"ccRestClient"}
var external_amd_ccRestClient_commonjs_ccRestClient_commonjs2_ccRestClient_ = __webpack_require__(5);
var external_amd_ccRestClient_commonjs_ccRestClient_commonjs2_ccRestClient_default = /*#__PURE__*/__webpack_require__.n(external_amd_ccRestClient_commonjs_ccRestClient_commonjs2_ccRestClient_);

// EXTERNAL MODULE: external {"amd":"jquery","commonjs":"jquery","commonjs2":"jquery"}
var external_amd_jquery_commonjs_jquery_commonjs2_jquery_ = __webpack_require__(2);
var external_amd_jquery_commonjs_jquery_commonjs2_jquery_default = /*#__PURE__*/__webpack_require__.n(external_amd_jquery_commonjs_jquery_commonjs2_jquery_);

// CONCATENATED MODULE: ./widget/isv-occ-payment/js/constants/index.ts
var constants_a, constants_b;
var BASE_API_HOST = (constants_a = "") !== null && constants_a !== void 0 ? constants_a : '';
var BASE_API_URL = (constants_b = "/ccstorex/custom/isv-payment/v1") !== null && constants_b !== void 0 ? constants_b : '/ccstorex/custom/isv-payment/v1';
var Channels;
(function (Channels) {
    Channels["PREVIEW"] = "preview";
    Channels["STOREFRONT"] = "storefront";
})(Channels || (Channels = {}));

// CONCATENATED MODULE: ./widget/isv-occ-payment/js/services/occClient.ts
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};




var getData = function (method, params) {
    return method === 'post' ? { data: JSON.stringify(params) } : { data: params };
};
var occClient_OccClient = /** @class */ (function () {
    function OccClient() {
        var _this = this;
        this.isPreview = external_amd_knockout_commonjs_knockout_commonjs2_knockout_default.a.observable(false);
        this.channel = external_amd_knockout_commonjs_knockout_commonjs2_knockout_default.a.pureComputed(function () { return (_this.isPreview() ? Channels.PREVIEW : Channels.STOREFRONT); });
    }
    OccClient.prototype.init = function (widget) {
        this.isPreview(widget.isPreview());
    };
    OccClient.prototype.ajaxRequest = function (path, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.method, method = _c === void 0 ? 'get' : _c, _d = _b.data, data = _d === void 0 ? '' : _d, _e = _b.baseUrl, baseUrl = _e === void 0 ? "" + BASE_API_HOST + BASE_API_URL : _e;
        return external_amd_jquery_commonjs_jquery_commonjs2_jquery_["ajax"](__assign({ url: baseUrl + "/" + path, method: method, dataType: 'json', contentType: 'application/json', headers: {
                channel: this.channel()
            } }, getData(method, data)));
    };
    OccClient.prototype.loadPaymentMethods = function () {
        return this.ajaxRequest('paymentMethods');
    };
    OccClient.prototype.getCaptureContext = function () {
        var _a = window.location, protocol = _a.protocol, hostname = _a.hostname, port = _a.port;
        return this.ajaxRequest('keys', {
            method: 'post',
            data: {
                targetOrigin: protocol + "//" + hostname + (port ? ':' + port : '')
            }
        });
    };
    OccClient.prototype.generatePayerAuthJwt = function (orderData) {
        return this.ajaxRequest('payerAuth/generateJwt', { method: 'post', data: orderData });
    };
    OccClient.prototype.createApplePaySession = function (validationUrl) {
        return this.ajaxRequest('applepay/validate', { method: 'post', data: { validationUrl: validationUrl } });
    };
    OccClient.prototype.getCreditCardsForProfile = function () {
        return new Promise(function (resolve, reject) {
            external_amd_ccRestClient_commonjs_ccRestClient_commonjs2_ccRestClient_default.a.request('listCreditCards', {}, function (data) { return resolve(data.items); }, function (error) { return reject(error); });
        });
    };
    return OccClient;
}());
/* harmony default export */ var occClient = (new occClient_OccClient());

// CONCATENATED MODULE: ./widget/isv-occ-payment/js/common/deferred.ts
var Deferred = /** @class */ (function () {
    function Deferred() {
        var _this = this;
        this.promise = new Promise(function (resolve, reject) {
            _this._resolveSelf = resolve;
            _this._rejectSelf = reject;
        });
    }
    Deferred.prototype.finally = function (onfinally) {
        return this.promise.finally(onfinally);
    };
    Deferred.prototype.then = function (onfulfilled, onrejected) {
        return this.promise.then(onfulfilled, onrejected);
    };
    Deferred.prototype.catch = function (onrejected) {
        return this.promise.then(onrejected);
    };
    Deferred.prototype.resolve = function (val) {
        this._resolveSelf(val);
    };
    Deferred.prototype.reject = function (reason) {
        this._rejectSelf(reason);
    };
    return Deferred;
}());


// CONCATENATED MODULE: ./widget/isv-occ-payment/js/store/paymentStore.ts


var paymentStore_PaymentStore = /** @class */ (function () {
    function PaymentStore() {
        this.paymentMethods = external_amd_knockout_commonjs_knockout_commonjs2_knockout_default.a.observableArray([]);
        this.selectedPaymentMethod = external_amd_knockout_commonjs_knockout_commonjs2_knockout_default.a.observable();
        this.creditCardList = external_amd_knockout_commonjs_knockout_commonjs2_knockout_default.a.observableArray([]);
        this.paymentActions = external_amd_knockout_commonjs_knockout_commonjs2_knockout_default.a.observableArray();
        this.paymentDetails = new Deferred();
        this.paymentInProgress = external_amd_knockout_commonjs_knockout_commonjs2_knockout_default.a.observable(false);
        this.validationResults = external_amd_knockout_commonjs_knockout_commonjs2_knockout_default.a.observableArray();
    }
    PaymentStore.prototype.init = function (viewModel) {
        this.widget = viewModel;
        this.order = viewModel.order;
    };
    Object.defineProperty(PaymentStore.prototype, "cardTypeList", {
        get: function () {
            return this.order().contextData.page.payment.cards;
        },
        enumerable: false,
        configurable: true
    });
    return PaymentStore;
}());

/* harmony default export */ var paymentStore = (new paymentStore_PaymentStore());

// CONCATENATED MODULE: ./widget/isv-occ-payment/js/store/paymentActions.ts


// List of action which will reset payment details
var PAYMENT_DETAILS_ACTIONS = ['initiate', 'finalize', 'validateConsumerAuthentication'];
var resetPaymentDetails = function (action) {
    if (PAYMENT_DETAILS_ACTIONS.includes(action)) {
        paymentStore.paymentDetails = new Deferred();
    }
};
/* harmony default export */ var paymentActions = ({
    placeOrder: function () {
        paymentStore.order().handlePlaceOrder();
    },
    initiatePayment: function () {
        this.submitPaymentAction({
            type: 'initiate',
            paymentMethod: this.selectedPaymentMethod
        });
        paymentStore.paymentInProgress(true);
    },
    updatePaymentMethods: function (paymentMethodsResponse) {
        paymentStore.paymentMethods(paymentMethodsResponse.paymentMethods);
    },
    updateCreditCardList: function (creditCards) {
        paymentStore.creditCardList(creditCards);
    },
    nextPaymentAction: function (paymentResponse) {
        this.submitPaymentAction({
            type: paymentResponse.customPaymentProperties.action,
            paymentMethod: this.selectedPaymentMethod,
            payload: paymentResponse.customPaymentProperties
        });
    },
    finalizePayment: function (payload) {
        this.submitPaymentAction({
            type: 'finalize',
            paymentMethod: this.selectedPaymentMethod,
            payload: payload
        });
        paymentStore.paymentInProgress(false);
    },
    submitPaymentAction: function (action) {
        resetPaymentDetails(action.type);
        paymentStore.paymentActions.push(action);
    },
    submitPaymentDetails: function (paymentDetails) {
        paymentStore.paymentDetails.resolve(paymentDetails);
    },
    rejectPaymentDetails: function (paymentDetails) {
        paymentStore.paymentDetails.reject(paymentDetails);
    },
    validatePayment: function () {
        paymentStore.validationResults([]);
        this.submitPaymentAction({
            type: 'validate',
            paymentMethod: this.selectedPaymentMethod
        });
    },
    submitValidationResult: function (result) {
        paymentStore.validationResults.push(result);
    },
    takePaymentAction: function (predicate, callback) {
        paymentStore.paymentActions.subscribe(function (changes) {
            var matchingAction = changes.find(function (change) { return change.status == 'added' && predicate(change.value); });
            if (matchingAction) {
                callback(matchingAction.value);
            }
        }, this, 'arrayChange');
    },
    takePaymentDetails: function () {
        return paymentStore.paymentDetails;
    },
    get selectedPaymentMethod() {
        var _a;
        return (_a = paymentStore.selectedPaymentMethod()) === null || _a === void 0 ? void 0 : _a.type;
    }
});

// CONCATENATED MODULE: ./widget/isv-occ-payment/js/components/paymentComponentRegistry.ts
var REGISTRY = {};
function viewModelFactory(name, viewModelType, template) {
    return {
        viewModel: {
            createViewModel: function (params) {
                var paymentViewModel = new viewModelType(params);
                // Start component initialization at the time of creation
                // At this point templates are rendered, binding not yet applied
                paymentViewModel.initialize();
                REGISTRY[name] = paymentViewModel;
                return paymentViewModel;
            }
        },
        template: template
    };
}
function getPaymentComponent(name) {
    return REGISTRY[name];
}
function getAllComponents() {
    return Object.keys(REGISTRY).map(function (name) { return REGISTRY[name]; });
}

// EXTERNAL MODULE: ./widget/isv-occ-payment/js/components/ApplePay/index.html
var ApplePay = __webpack_require__(6);
var ApplePay_default = /*#__PURE__*/__webpack_require__.n(ApplePay);

// CONCATENATED MODULE: ./widget/isv-occ-payment/js/components/ApplePay/requestBuilder.ts

// TODO : Add proper data mapping
var getPaymentRequestData = function () {
    var _a = paymentStore.widget, order = _a.order, cart = _a.cart;
    var countryCode = order().billingAddress().selectedCountry();
    var currencyCode = cart().currencyCode();
    return {
        countryCode: countryCode,
        currencyCode: currencyCode,
        supportedNetworks: ['visa', 'masterCard', 'amex', 'discover'],
        merchantCapabilities: ['supports3DS'],
        total: { label: 'OCC', amount: '100', type: 'final' }
    };
};

// CONCATENATED MODULE: ./widget/isv-occ-payment/js/components/ApplePay/index.ts
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};






var actionFilter = function (action) { return function (paymentAction) {
    return paymentAction.type == action && paymentAction.paymentMethod == 'applepay';
}; };
var ApplePay_PaymentApple = /** @class */ (function () {
    function PaymentApple(params) {
        this.supported = external_amd_knockout_commonjs_knockout_commonjs2_knockout_default.a.observable(false);
        this.config = params.config;
    }
    PaymentApple.prototype.initialize = function () {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                if (this.canMakePayments()) {
                    this.supported(true);
                    this.initializePaymentActions();
                }
                return [2 /*return*/, Promise.resolve()];
            });
        });
    };
    PaymentApple.prototype.initializePaymentActions = function () {
        paymentActions.takePaymentAction(actionFilter('initiate'), this.initiatePayment.bind(this));
        paymentActions.takePaymentAction(actionFilter('finalize'), this.finalizePayment.bind(this));
    };
    PaymentApple.prototype.initiatePayment = function (_action) {
        this.createSession().begin();
    };
    PaymentApple.prototype.finalizePayment = function (action) {
        var status = action.payload.success
            ? ApplePaySession.STATUS_SUCCESS
            : ApplePaySession.STATUS_FAILURE;
        this.session.completePayment(status);
    };
    PaymentApple.prototype.createSession = function () {
        if (this.session) {
            this.session.abort();
        }
        this.session = new ApplePaySession(3, getPaymentRequestData());
        this.session.onvalidatemerchant = this.onValidateMerchant.bind(this);
        this.session.onpaymentauthorized = this.onPaymentAuthorized.bind(this);
        this.session.oncancel = this.onCancel.bind(this);
        return this.session;
    };
    PaymentApple.prototype.triggerPayment = function () {
        paymentActions.placeOrder();
    };
    // TODO : add error handling
    PaymentApple.prototype.onValidateMerchant = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var merchSession;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, occClient.createApplePaySession(event.validationURL)];
                    case 1:
                        merchSession = _a.sent();
                        this.session.completeMerchantValidation(merchSession);
                        return [2 /*return*/];
                }
            });
        });
    };
    PaymentApple.prototype.onPaymentAuthorized = function (event) {
        paymentActions.submitPaymentDetails({
            type: 'generic',
            customProperties: {
                paymentType: 'applepay',
                paymentToken: JSON.stringify(event.payment.token.paymentData)
            }
        });
    };
    PaymentApple.prototype.onCancel = function (_event) {
        paymentActions.rejectPaymentDetails({
            type: 'cancel'
        });
    };
    PaymentApple.prototype.canMakePayments = function () {
        return window.ApplePaySession && ApplePaySession.canMakePayments();
    };
    PaymentApple.prototype.validate = function () {
        return this.canMakePayments();
    };
    return PaymentApple;
}());
/* harmony default export */ var components_ApplePay = (viewModelFactory('applepay', ApplePay_PaymentApple, ApplePay_default.a));

// EXTERNAL MODULE: /Users/sbondarenco/projects/tk/cybersource/poc/isv-oracle-commerce-cloud/node_modules/jwt-decode/lib/index.js
var lib = __webpack_require__(3);
var lib_default = /*#__PURE__*/__webpack_require__.n(lib);

// CONCATENATED MODULE: ./widget/isv-occ-payment/js/components/utils/scriptLoader.ts
var scriptLoader_awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var scriptLoader_generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
function loadScript(url) {
    return new Promise(function (resolve, reject) {
        var scriptToLoad = document.createElement('script');
        scriptToLoad.setAttribute('src', url);
        scriptToLoad.onload = function () { return resolve(); };
        scriptToLoad.onerror = function () { return reject(); };
        document.body.appendChild(scriptToLoad);
    });
}
var isAmd = function () { return 'function' == typeof window.require; };
function amdJsLoad(url, globalEnvName) {
    return scriptLoader_awaiter(this, void 0, Promise, function () {
        return scriptLoader_generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (isAmd()) {
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                try {
                                    window.require([url], function (module) {
                                        resolve(module);
                                        // Reassigning AMD exported module as global variable
                                        window[globalEnvName] = module[globalEnvName];
                                    });
                                }
                                catch (err) {
                                    reject(err);
                                }
                            })];
                    }
                    return [4 /*yield*/, loadScript(url)];
                case 1:
                    _a.sent();
                    return [2 /*return*/, window[globalEnvName]];
            }
        });
    });
}

// CONCATENATED MODULE: ./widget/isv-occ-payment/js/components/Card/cardinalCommerce.ts
var cardinalCommerce_awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var cardinalCommerce_generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};




var getOrderData = function () {
    var order = paymentStore.widget.order();
    var cart = paymentStore.widget.cart();
    var id = order.id, shippingAddress = order.shippingAddress, billingAddress = order.billingAddress;
    var currencyCode = cart.currencyCode, total = cart.total;
    var shoppingCart = {
        orderTotal: total,
        items: cart.items().map(function (_a) {
            var productId = _a.productId, quantity = _a.quantity;
            return ({
                productId: productId,
                quantity: quantity
            });
        })
    };
    return external_amd_knockout_commonjs_knockout_commonjs2_knockout_default.a.toJS({
        orderId: id,
        currencyCode: currencyCode,
        shippingAddress: shippingAddress(),
        billingAddress: billingAddress(),
        shoppingCart: shoppingCart
    });
};
var cardinalCommerce_CardinalCommerce = /** @class */ (function () {
    function CardinalCommerce() {
        this.referenceId = new Deferred();
        this.authJwt = new Deferred();
    }
    CardinalCommerce.prototype.updateBin = function (bin) {
        Cardinal.trigger('bin.process', bin);
    };
    CardinalCommerce.prototype.onSetupComplete = function (data) {
        this.referenceId.resolve(data.sessionId);
    };
    CardinalCommerce.prototype.onValidated = function (data, authJwt) {
        console.debug('>>> PayerAuth Validation Result:', {
            data: data,
            authJwt: authJwt
        });
        if (data.ErrorNumber === 0) {
            // TODO Return authJwt and decode on server side
            this.authJwt.resolve(data.Payment.ProcessorTransactionId);
        }
        else {
            this.authJwt.reject(data.ErrorNumber);
        }
    };
    CardinalCommerce.prototype.generatePayerAuthJwt = function () {
        return cardinalCommerce_awaiter(this, void 0, void 0, function () {
            var orderData, payerAuthJwt;
            return cardinalCommerce_generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        orderData = getOrderData();
                        return [4 /*yield*/, occClient.generatePayerAuthJwt(orderData)];
                    case 1:
                        payerAuthJwt = _a.sent();
                        return [2 /*return*/, payerAuthJwt];
                }
            });
        });
    };
    CardinalCommerce.prototype.setup = function () {
        return cardinalCommerce_awaiter(this, void 0, void 0, function () {
            var jwt;
            return cardinalCommerce_generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.generatePayerAuthJwt()];
                    case 1:
                        jwt = _a.sent();
                        Cardinal.setup('init', jwt);
                        Cardinal.on('payments.setupComplete', this.onSetupComplete.bind(this));
                        Cardinal.on('payments.validated', this.onValidated.bind(this));
                        return [2 /*return*/];
                }
            });
        });
    };
    //Card is enrolled in a payer authentication program. Proceed to validation
    CardinalCommerce.prototype.validatePayment = function (validationOptions) {
        Cardinal.continue('cca', {
            AcsUrl: validationOptions.acsUrl,
            Payload: validationOptions.pareq
        }, {
            OrderDetails: {
                TransactionId: validationOptions.authenticationTransactionId
            }
        });
        return this.authJwt;
    };
    return CardinalCommerce;
}());
/* harmony default export */ var cardinalCommerce = (cardinalCommerce_CardinalCommerce);

// CONCATENATED MODULE: ./widget/isv-occ-payment/js/components/Card/flexMicroForm.ts
var flexMicroForm_awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var flexMicroForm_generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};

var microformStyles = {
    valid: { color: '#19212b' },
    invalid: { color: '#a94442' }
};
var flexMicroForm_Microform = /** @class */ (function () {
    function Microform(options) {
        var _this = this;
        this.options = options;
        this.cardNumberIsValid = external_amd_knockout_commonjs_knockout_commonjs2_knockout_default.a.observable(false);
        this.securityCodeIsValid = external_amd_knockout_commonjs_knockout_commonjs2_knockout_default.a.observable(false);
        this.formIsValid = external_amd_knockout_commonjs_knockout_commonjs2_knockout_default.a.pureComputed(function () { return _this.cardNumberIsValid() && _this.securityCodeIsValid(); });
        this.cardType = external_amd_knockout_commonjs_knockout_commonjs2_knockout_default.a.observable('');
    }
    Microform.prototype.handleCardNumberChange = function (data) {
        var hasCardData = data.card.length > 0;
        this.cardType(hasCardData ? data.card[0].name : '');
        this.cardNumberIsValid(Boolean(hasCardData && data.card[0].valid));
    };
    Microform.prototype.handleSecurityCodeChange = function (data) {
        this.securityCodeIsValid(Boolean(data.valid));
    };
    Microform.prototype.setup = function (captureContext) {
        return flexMicroForm_awaiter(this, void 0, void 0, function () {
            var number, securityCode;
            return flexMicroForm_generator(this, function (_a) {
                this.microform = new Flex(captureContext).microform({
                    styles: microformStyles
                });
                number = this.microform.createField('number', {
                    placeholder: 'Card Number'
                });
                securityCode = this.microform.createField('securityCode', { placeholder: '***' });
                number.load(this.options.cardNumberContainer);
                number.on('change', this.handleCardNumberChange.bind(this));
                securityCode.load(this.options.securityCodeContainer);
                securityCode.on('change', this.handleSecurityCodeChange.bind(this));
                return [2 /*return*/];
            });
        });
    };
    Microform.prototype.createToken = function (expirationMonth, expirationYear) {
        var _this = this;
        var cardOptions = { expirationMonth: expirationMonth, expirationYear: expirationYear };
        return new Promise(function (resolve, reject) {
            _this.microform.createToken(cardOptions, function (err, response) {
                if (err) {
                    reject(err.message);
                    return;
                }
                resolve(response);
            });
        });
    };
    return Microform;
}());
/* harmony default export */ var flexMicroForm = (flexMicroForm_Microform);

// EXTERNAL MODULE: ./widget/isv-occ-payment/js/components/Card/index.html
var Card = __webpack_require__(7);
var Card_default = /*#__PURE__*/__webpack_require__.n(Card);

// CONCATENATED MODULE: ./widget/isv-occ-payment/js/components/Card/utils.ts
var YEAR_LIST_LENGTH = 20;
var getEndYears = function () {
    var years = [];
    var endYear = new Date().getFullYear();
    for (var i = 0; i < YEAR_LIST_LENGTH; i++) {
        years.push({ name: endYear.toString(), value: endYear.toString() });
        ++endYear;
    }
    return years;
};

// CONCATENATED MODULE: ./widget/isv-occ-payment/js/components/Card/index.ts
var Card_assign = (undefined && undefined.__assign) || function () {
    Card_assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return Card_assign.apply(this, arguments);
};
var Card_awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var Card_generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};











var Card_actionFilter = function (action) { return function (paymentAction) {
    return paymentAction.type == action && paymentAction.paymentMethod == 'card';
}; };
var Card_PaymentCard = /** @class */ (function () {
    function PaymentCard(params) {
        this.creditCardList = paymentStore.creditCardList;
        this.expirationMonth = external_amd_knockout_commonjs_knockout_commonjs2_knockout_default.a.observable('');
        this.expirationYear = external_amd_knockout_commonjs_knockout_commonjs2_knockout_default.a.observable('');
        this.nameOnCard = external_amd_knockout_commonjs_knockout_commonjs2_knockout_default.a.observable('');
        this.selectedCardType = external_amd_knockout_commonjs_knockout_commonjs2_knockout_default.a.observable('');
        this.saveCard = external_amd_knockout_commonjs_knockout_commonjs2_knockout_default.a.observable(false);
        this.setAsDefault = external_amd_knockout_commonjs_knockout_commonjs2_knockout_default.a.observable(false);
        this.config = params.config;
        this.endYearList = external_amd_knockout_commonjs_knockout_commonjs2_knockout_default.a.observableArray(getEndYears());
        this.cardTypeList = external_amd_knockout_commonjs_knockout_commonjs2_knockout_default.a.observableArray(paymentStore.cardTypeList);
        this.microform = new flexMicroForm({
            sdkUrl: this.config.flexSdkUrl,
            securityCodeContainer: '#flexSecurityCode-container',
            cardNumberContainer: '#flexCardNumber-container'
        });
        this.cardinal = new cardinalCommerce();
    }
    PaymentCard.prototype.initialize = function () {
        return Card_awaiter(this, void 0, void 0, function () {
            var captureContextData;
            return Card_generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, amdJsLoad(this.config.flexSdkUrl, 'Flex')];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, occClient.getCaptureContext()];
                    case 2:
                        captureContextData = _a.sent();
                        return [4 /*yield*/, this.microform.setup(captureContextData.captureContext)];
                    case 3:
                        _a.sent();
                        this.microform.cardType.subscribe(this.preSelectCardType, this);
                        if (!this.config.payerAuthEnabled) return [3 /*break*/, 6];
                        return [4 /*yield*/, loadScript(this.config.songbirdUrl)];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.cardinal.setup()];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        this.initializePaymentActions();
                        return [2 /*return*/];
                }
            });
        });
    };
    PaymentCard.prototype.preSelectCardType = function (type) {
        var cardTypeIsSupported = this.cardTypeList().find(function (data) { return data.value == type; });
        this.selectedCardType(cardTypeIsSupported ? type : '');
    };
    PaymentCard.prototype.initializePaymentActions = function () {
        paymentActions.takePaymentAction(Card_actionFilter('initiate'), this.initiatePayment.bind(this));
        paymentActions.takePaymentAction(Card_actionFilter('validate'), this.validatePayment.bind(this));
        paymentActions.takePaymentAction(Card_actionFilter('finalize'), this.finalizePayment.bind(this));
        paymentActions.takePaymentAction(Card_actionFilter('validateConsumerAuthentication'), this.validateConsumerAuthentication.bind(this));
    };
    PaymentCard.prototype.initiatePayment = function (_action) {
        return Card_awaiter(this, void 0, void 0, function () {
            var transientTokenJwt, decodedFlexToken, _a, _b, _c, _d, _e, _f;
            return Card_generator(this, function (_g) {
                switch (_g.label) {
                    case 0: return [4 /*yield*/, this.getTransientToken()];
                    case 1:
                        transientTokenJwt = _g.sent();
                        decodedFlexToken = lib_default()(transientTokenJwt);
                        if (this.config.payerAuthEnabled) {
                            this.updateBin(decodedFlexToken.data.number);
                        }
                        _b = (_a = paymentActions).submitPaymentDetails;
                        _c = [Card_assign({}, this.getCardDetails(decodedFlexToken))];
                        _d = {};
                        _e = [{ transientTokenJwt: transientTokenJwt }];
                        _f = this.config.payerAuthEnabled;
                        if (!_f) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.getPayerAuthReferenceId()];
                    case 2:
                        _f = (_g.sent());
                        _g.label = 3;
                    case 3:
                        _b.apply(_a, [Card_assign.apply(void 0, _c.concat([(_d.customProperties = Card_assign.apply(void 0, _e.concat([(_f)])), _d)]))]);
                        return [2 /*return*/];
                }
            });
        });
    };
    PaymentCard.prototype.validatePayment = function (_action) {
        if (!this.validate()) {
            paymentActions.submitValidationResult({
                valid: false,
                message: 'Provided card details are not valid. Please check your input'
            });
        }
    };
    PaymentCard.prototype.finalizePayment = function (_action) {
        this.transientTokenJwt = undefined;
    };
    PaymentCard.prototype.validateConsumerAuthentication = function (action) {
        return Card_awaiter(this, void 0, void 0, function () {
            var authJwt, transientTokenJwt, decodedFlexToken;
            return Card_generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.cardinal.validatePayment(action.payload)];
                    case 1:
                        authJwt = _a.sent();
                        return [4 /*yield*/, this.getTransientToken()];
                    case 2:
                        transientTokenJwt = _a.sent();
                        decodedFlexToken = lib_default()(transientTokenJwt);
                        paymentActions.submitPaymentDetails(Card_assign(Card_assign({}, this.getCardDetails(decodedFlexToken)), { customProperties: {
                                transientTokenJwt: transientTokenJwt,
                                authenticationTransactionId: authJwt
                            } }));
                        return [2 /*return*/];
                }
            });
        });
    };
    PaymentCard.prototype.validate = function () {
        return (Boolean(this.expirationMonth()) &&
            Boolean(this.expirationYear()) &&
            this.microform.formIsValid());
    };
    PaymentCard.prototype.updateBin = function (maskedCardNumber) {
        this.cardinal.updateBin(maskedCardNumber.substring(0, 6));
    };
    PaymentCard.prototype.getPayerAuthReferenceId = function () {
        return Card_awaiter(this, void 0, void 0, function () {
            var _a;
            return Card_generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = {};
                        return [4 /*yield*/, this.cardinal.referenceId];
                    case 1: return [2 /*return*/, (_a.referenceId = _b.sent(),
                            _a)];
                }
            });
        });
    };
    PaymentCard.prototype.getTransientToken = function () {
        return Card_awaiter(this, void 0, void 0, function () {
            var _a;
            return Card_generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(this.transientTokenJwt === undefined)) return [3 /*break*/, 2];
                        _a = this;
                        return [4 /*yield*/, this.microform.createToken(this.expirationMonth(), this.expirationYear())];
                    case 1:
                        _a.transientTokenJwt = _b.sent();
                        _b.label = 2;
                    case 2: return [2 /*return*/, this.transientTokenJwt];
                }
            });
        });
    };
    PaymentCard.prototype.getCardDetails = function (flexToken) {
        return Card_assign(Card_assign({ type: 'card', nameOnCard: this.nameOnCard(), cardNumber: flexToken.data.number, expiryMonth: flexToken.data.expirationMonth, expiryYear: flexToken.data.expirationYear }, (this.saveCard() && {
            saveCard: true
        })), (this.setAsDefault() && {
            setAsDefault: true
        }));
    };
    return PaymentCard;
}());
/* harmony default export */ var components_Card = (viewModelFactory('card', Card_PaymentCard, Card_default.a));

// EXTERNAL MODULE: ./widget/isv-occ-payment/js/components/GooglePay/index.html
var GooglePay = __webpack_require__(8);
var GooglePay_default = /*#__PURE__*/__webpack_require__.n(GooglePay);

// CONCATENATED MODULE: ./widget/isv-occ-payment/js/components/GooglePay/requestBuilder.ts
var requestBuilder_assign = (undefined && undefined.__assign) || function () {
    requestBuilder_assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return requestBuilder_assign.apply(this, arguments);
};
var baseRequest = {
    apiVersion: 2,
    apiVersionMinor: 0
};
var baseCardPaymentMethod = {
    type: 'CARD',
    parameters: {
        allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
        allowedCardNetworks: ['AMEX', 'DISCOVER', 'INTERAC', 'JCB', 'MASTERCARD', 'VISA']
    }
};
var getGoogleTransactionInfo = function () {
    return {
        displayItems: [
            {
                label: 'Subtotal',
                type: 'SUBTOTAL',
                price: '11.00'
            },
            {
                label: 'Tax',
                type: 'TAX',
                price: '1.00'
            }
        ],
        countryCode: 'US',
        currencyCode: 'USD',
        totalPriceStatus: 'FINAL',
        totalPrice: '12.00',
        totalPriceLabel: 'Total'
    };
};
var getGoogleIsReadyToPayRequest = function (_config) {
    return requestBuilder_assign(requestBuilder_assign({}, baseRequest), { allowedPaymentMethods: [baseCardPaymentMethod] });
};
var getGooglePaymentDataRequest = function (config) {
    return requestBuilder_assign(requestBuilder_assign({}, baseRequest), { allowedPaymentMethods: [
            requestBuilder_assign(requestBuilder_assign({}, baseCardPaymentMethod), { tokenizationSpecification: {
                    type: 'PAYMENT_GATEWAY',
                    parameters: {
                        gateway: config.googlePayGateway,
                        gatewayMerchantId: config.googlePayGatewayMerchantId
                    }
                } })
        ], transactionInfo: getGoogleTransactionInfo(), merchantInfo: {
            merchantId: config.googlePayMerchantId,
            merchantName: config.googlePayMerchantName
        }, callbackIntents: ['PAYMENT_AUTHORIZATION'] });
};

// CONCATENATED MODULE: ./widget/isv-occ-payment/js/components/GooglePay/index.ts
var GooglePay_awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var GooglePay_generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};







var SUCCESS = { transactionState: 'SUCCESS' };
var ERROR = {
    transactionState: 'ERROR',
    error: {
        intent: 'PAYMENT_AUTHORIZATION',
        message: 'Insufficient funds',
        reason: 'PAYMENT_DATA_INVALID'
    }
};
var GooglePay_actionFilter = function (action) { return function (paymentAction) {
    return paymentAction.type == action && paymentAction.paymentMethod == 'googlepay';
}; };
var GooglePay_PaymentGoogle = /** @class */ (function () {
    function PaymentGoogle(params) {
        this.supported = external_amd_knockout_commonjs_knockout_commonjs2_knockout_default.a.observable(false);
        this.config = params.config;
        this.paymentResult = new Deferred();
    }
    PaymentGoogle.prototype.initialize = function () {
        return GooglePay_awaiter(this, void 0, Promise, function () {
            var response;
            return GooglePay_generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, loadScript(this.config.googlePaySdkUrl)];
                    case 1:
                        _a.sent();
                        this.createClient();
                        return [4 /*yield*/, this.paymentsClient.isReadyToPay(getGoogleIsReadyToPayRequest(this.config))];
                    case 2:
                        response = _a.sent();
                        if (response.result) {
                            this.addGooglePayButton();
                            this.supported(true);
                            this.initializePaymentActions();
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    PaymentGoogle.prototype.initializePaymentActions = function () {
        paymentActions.takePaymentAction(GooglePay_actionFilter('initiate'), this.initiatePayment.bind(this));
        paymentActions.takePaymentAction(GooglePay_actionFilter('finalize'), this.finalizePayment.bind(this));
    };
    // TODO Identify whether it is cancel or another error
    PaymentGoogle.prototype.initiatePayment = function (_action) {
        this.loadPaymentData().catch(function (error) {
            return paymentActions.rejectPaymentDetails({
                type: 'cancel',
                data: error
            });
        });
    };
    PaymentGoogle.prototype.finalizePayment = function (action) {
        var _a;
        (_a = this.paymentResult) === null || _a === void 0 ? void 0 : _a.resolve(action.payload.success ? SUCCESS : ERROR);
        this.paymentResult = new Deferred();
    };
    PaymentGoogle.prototype.createClient = function () {
        if (this.paymentsClient === undefined) {
            this.paymentsClient = new google.payments.api.PaymentsClient({
                environment: this.config.googlePayEnvironment || 'TEST',
                paymentDataCallbacks: {
                    onPaymentAuthorized: this.onPaymentAuthorized.bind(this)
                }
            });
        }
    };
    /**
     * Resolving PaymentDetails state once payment token is available
     */
    PaymentGoogle.prototype.submitPaymentDetails = function (paymentData) {
        paymentActions.submitPaymentDetails({
            type: 'generic',
            customProperties: {
                paymentType: 'googlepay',
                paymentToken: paymentData.paymentMethodData.tokenizationData.token
            }
        });
    };
    PaymentGoogle.prototype.onPaymentAuthorized = function (paymentData) {
        this.submitPaymentDetails(paymentData);
        return this.paymentResult;
    };
    PaymentGoogle.prototype.loadPaymentData = function () {
        var paymentDataRequest = getGooglePaymentDataRequest(this.config);
        return this.paymentsClient.loadPaymentData(paymentDataRequest);
    };
    PaymentGoogle.prototype.addGooglePayButton = function () {
        var _a;
        var button = this.paymentsClient.createButton({
            onClick: paymentActions.placeOrder
        });
        (_a = document.getElementById('googlePayButtonContainer')) === null || _a === void 0 ? void 0 : _a.appendChild(button);
    };
    PaymentGoogle.prototype.validate = function () {
        return this.supported();
    };
    return PaymentGoogle;
}());
/* harmony default export */ var components_GooglePay = (viewModelFactory('googlepay', GooglePay_PaymentGoogle, GooglePay_default.a));

// EXTERNAL MODULE: ./widget/isv-occ-payment/js/components/PaymentSelector/index.html
var components_PaymentSelector = __webpack_require__(9);
var PaymentSelector_default = /*#__PURE__*/__webpack_require__.n(components_PaymentSelector);

// CONCATENATED MODULE: ./widget/isv-occ-payment/js/components/PaymentSelector/index.ts


var PaymentSelector_PaymentSelector = /** @class */ (function () {
    function PaymentSelector(params) {
        var _this = this;
        this.paymentMethods = params.paymentMethods;
        this.selectedMethod = this.paymentMethods()[0];
        this.paymentMethods.subscribe(function (newPaymentMethods) { return _this.selectMethod(newPaymentMethods[0]); });
    }
    PaymentSelector.prototype.isSelected = function (method) {
        return method == this.selectedMethod;
    };
    PaymentSelector.prototype.selectMethod = function (method) {
        this.selectedMethod = method;
        // Update global state so that application logic becomes aware of current selected payment component
        paymentStore.selectedPaymentMethod(method);
    };
    return PaymentSelector;
}());
/* harmony default export */ var js_components_PaymentSelector = ({
    viewModel: PaymentSelector_PaymentSelector,
    template: PaymentSelector_default.a
});

// CONCATENATED MODULE: ./widget/isv-occ-payment/js/components/index.ts







external_amd_knockout_commonjs_knockout_commonjs2_knockout_default.a.components.register('payment-selector', js_components_PaymentSelector);
external_amd_knockout_commonjs_knockout_commonjs2_knockout_default.a.components.register('payment-method-card', components_Card);
external_amd_knockout_commonjs_knockout_commonjs2_knockout_default.a.components.register('payment-method-googlepay', components_GooglePay);
external_amd_knockout_commonjs_knockout_commonjs2_knockout_default.a.components.register('payment-method-applepay', components_ApplePay);
var updatePaymentMethods = function (paymentMethodsResponse) {
    paymentActions.updatePaymentMethods(paymentMethodsResponse);
};
var updateCreditCardList = function (creditCards) {
    paymentActions.updateCreditCardList(creditCards);
};
/* harmony default export */ var components = ({
    /**
     * Is run once any re-population of mapping data has occurred.
     * This can be useful when a Web API call is required every time the widget is shown,
     * or, some other functionality required every time the widget is shown
     */
    beforeAppear: function () {
        occClient
            .loadPaymentMethods() // Load all payment methods from SSE
            .then(updatePaymentMethods); // Store payment methods and render payment type specific components
        occClient
            .getCreditCardsForProfile() // Load saved credit cards for current profile
            .then(updateCreditCardList); // Store saved card list
    }
});

// EXTERNAL MODULE: external {"amd":"ccLogger","commonjs":"ccLogger","commonjs2":"ccLogger"}
var external_amd_ccLogger_commonjs_ccLogger_commonjs2_ccLogger_ = __webpack_require__(1);
var external_amd_ccLogger_commonjs_ccLogger_commonjs2_ccLogger_default = /*#__PURE__*/__webpack_require__.n(external_amd_ccLogger_commonjs_ccLogger_commonjs2_ccLogger_);

// EXTERNAL MODULE: external {"amd":"pubsub","commonjs":"pubsub","commonjs2":"pubsub"}
var external_amd_pubsub_commonjs_pubsub_commonjs2_pubsub_ = __webpack_require__(4);
var external_amd_pubsub_commonjs_pubsub_commonjs2_pubsub_default = /*#__PURE__*/__webpack_require__.n(external_amd_pubsub_commonjs_pubsub_commonjs2_pubsub_);

// CONCATENATED MODULE: ./widget/isv-occ-payment/js/services/checkout.ts
var checkout_awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var checkout_generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};





var checkout_orderViewModel = function () { return paymentStore.order(); };
var validatePayment = function () {
    paymentActions.validatePayment();
    var validationResults = paymentStore.validationResults;
    if (validationResults().length > 0) {
        validationResults().forEach(function (result) {
            if (!result.valid) {
                checkout_orderViewModel().addValidationError('paymentValidationError', result.message);
            }
        });
    }
    else {
        // Adding dummy payment details until it is later resolved
        // This will make OCC skip OOTB paymentDetails validations
        checkout_orderViewModel().updatePayments([{}]);
    }
};
/**
 * Callback is triggered when payment was successful and order has been submitted to OMS
 * Customer is redirected to order confirmation page afterwards
 */
var onOrderCompleted = function (eventData) {
    var paymentResponse = eventData.payment[0];
    var paymentResult = {
        success: paymentResponse.paymentState == 'AUTHORIZED'
    };
    external_amd_ccLogger_commonjs_ccLogger_commonjs2_ccLogger_default.a.debug('>>> ORDER_COMPLETED, finalize payment', paymentResult);
    paymentActions.finalizePayment(paymentResult);
};
/**
 * Callback is triggered when order submission failed with 500 error
 */
var onOrderSubmissionFail = function (_eventData) {
    paymentActions.finalizePayment({
        success: false
    });
};
/**
 * An extended version of the native orderViewModel.createOrder which waits until payment details become available
 * Current OCC implementation does not support asynchronous payment details
 */
var createOrder = function () { return checkout_awaiter(void 0, void 0, void 0, function () {
    var paymentDetails, error_1;
    return checkout_generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!paymentStore.paymentInProgress()) {
                    external_amd_ccLogger_commonjs_ccLogger_commonjs2_ccLogger_default.a.debug('>>> Initiating payment');
                    paymentActions.initiatePayment();
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, paymentActions.takePaymentDetails()];
            case 2:
                paymentDetails = _a.sent();
                external_amd_ccLogger_commonjs_ccLogger_commonjs2_ccLogger_default.a.debug('>>> Payment details retrieved', paymentDetails);
                checkout_orderViewModel().updatePayments([paymentDetails]);
                checkout_orderViewModel().nativeCreateOrder();
                return [3 /*break*/, 4];
            case 3:
                error_1 = _a.sent();
                external_amd_ccLogger_commonjs_ccLogger_commonjs2_ccLogger_default.a.error('>>> Failed to retrieve payment details', error_1);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
/**
 * An extended version of the native orderViewModel.postOrderCreateOrUpdateSuccess which handles additional actions required to finalize payment
 * This is required by Payer Authentication process where customer takes additional authentication step
 * Once consumer authentication process is finished order placement is handled again
 */
var postOrderCreateOrUpdateSuccess = function (data) {
    var _a;
    var paymentResponse = data.payments[0];
    var nextAction = (_a = paymentResponse.customPaymentProperties) === null || _a === void 0 ? void 0 : _a.action;
    external_amd_ccLogger_commonjs_ccLogger_commonjs2_ccLogger_default.a.debug('>>> Order create or update success', data);
    if (nextAction) {
        external_amd_ccLogger_commonjs_ccLogger_commonjs2_ccLogger_default.a.debug('>>> Next payment action', nextAction);
        paymentActions.nextPaymentAction(paymentResponse);
        createOrder();
    }
    else {
        checkout_orderViewModel().nativePostOrderCreateOrUpdateSuccess(data);
    }
};
/**
 * Extend native implementation of both 'handlePlaceOrder' and 'postOrderCreateOrUpdateSuccess' with additional logic
 */
var extendOrderViewModel = function () {
    var orderViewModel = paymentStore.order();
    var nativeCreateOrder = orderViewModel.createOrder.bind(orderViewModel);
    var nativePostOrderCreateOrUpdateSuccess = orderViewModel.postOrderCreateOrUpdateSuccess.bind(orderViewModel);
    Object.assign(orderViewModel, {
        createOrder: createOrder,
        postOrderCreateOrUpdateSuccess: postOrderCreateOrUpdateSuccess,
        nativeCreateOrder: nativeCreateOrder,
        nativePostOrderCreateOrUpdateSuccess: nativePostOrderCreateOrUpdateSuccess
    });
};
/* harmony default export */ var checkout = ({
    init: function () {
        paymentStore.order().addValidationCallback(validatePayment);
        extendOrderViewModel();
        external_amd_jquery_commonjs_jquery_commonjs2_jquery_default.a.Topic(external_amd_pubsub_commonjs_pubsub_commonjs2_pubsub_default.a.topicNames.ORDER_COMPLETED).subscribe(onOrderCompleted);
        external_amd_jquery_commonjs_jquery_commonjs2_jquery_default.a.Topic(external_amd_pubsub_commonjs_pubsub_commonjs2_pubsub_default.a.topicNames.ORDER_SUBMISSION_FAIL).subscribe(onOrderSubmissionFail);
    }
});

// CONCATENATED MODULE: ./widget/isv-occ-payment/js/isv-occ-payment.ts




var isv_occ_payment_PaymentWidget = /** @class */ (function () {
    function PaymentWidget() {
        var _this = this;
        this.store = paymentStore;
        this.beforeAppear = function () {
            components.beforeAppear();
        };
        this.onLoad = function (widget) {
            paymentStore.init(widget);
            occClient.init(widget);
            checkout.init();
            Object.assign(_this, widget);
        };
    }
    return PaymentWidget;
}());
/* harmony default export */ var isv_occ_payment = __webpack_exports__["default"] = (new isv_occ_payment_PaymentWidget());


/***/ })
/******/ ])["default"]});;
//# sourceMappingURL=isv-occ-payment.bundle.js.map